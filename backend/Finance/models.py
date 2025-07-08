from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid

class TaxConfiguration(models.Model):
    """Tax configuration for different regions/products"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4)  # 0.1250 = 12.5%
    tax_type = models.CharField(max_length=20, choices=[
        ('VAT', 'Value Added Tax'),
        ('GST', 'Goods and Services Tax'),
        ('SALES', 'Sales Tax'),
        ('EXCISE', 'Excise Tax'),
    ])
    # applicable_categories = models.ManyToManyField('Medicine.DrugCategory', blank=True)  # Commented out until DrugCategory is created
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.tax_rate * 100}%"

class ExpenseCategory(models.Model):
    """Categories for business expenses"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent_category = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Expense Categories"
    
    def __str__(self):
        return self.name

class Expense(models.Model):
    """Business expenses tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    expense_date = models.DateField()
    vendor = models.CharField(max_length=255, blank=True)
    receipt_number = models.CharField(max_length=100, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=20, choices=[
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ], blank=True)
    notes = models.TextField(blank=True)
    # receipt_image = models.ImageField(upload_to='receipts/', blank=True)  # Commented out until Pillow is installed
    receipt_image_path = models.CharField(max_length=255, blank=True)  # Alternative to ImageField
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.description} - ${self.amount}"

class FinancialPeriod(models.Model):
    """Financial reporting periods"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # "Q1 2024", "January 2024", etc.
    period_type = models.CharField(max_length=20, choices=[
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ])
    start_date = models.DateField()
    end_date = models.DateField()
    is_closed = models.BooleanField(default=False)
    closed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.pharmacy.name} - {self.name}"

class ProfitLossStatement(models.Model):
    """Profit & Loss statements"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    period = models.ForeignKey(FinancialPeriod, on_delete=models.CASCADE)
    
    # Revenue
    gross_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    returns_allowances = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Cost of Goods Sold
    opening_inventory = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    closing_inventory = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Gross Profit
    gross_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Operating Expenses
    salaries_wages = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    rent_utilities = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    marketing_advertising = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    depreciation = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_operating_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Net Income
    operating_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    interest_expense = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    taxes = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    def calculate_statement(self):
        """Calculate all derived fields"""
        self.net_sales = self.gross_sales - self.returns_allowances
        self.cogs = self.opening_inventory + self.purchases - self.closing_inventory
        self.gross_profit = self.net_sales - self.cogs
        self.total_operating_expenses = (
            self.salaries_wages + self.rent_utilities + self.marketing_advertising +
            self.insurance + self.depreciation + self.other_expenses
        )
        self.operating_income = self.gross_profit - self.total_operating_expenses
        self.net_income = self.operating_income + self.other_income - self.interest_expense - self.taxes
        self.save()
    
    def __str__(self):
        return f"P&L: {self.pharmacy.name} - {self.period.name}"

class CashFlow(models.Model):
    """Cash flow tracking"""
    FLOW_TYPES = [
        ('OPERATING', 'Operating Activities'),
        ('INVESTING', 'Investing Activities'),
        ('FINANCING', 'Financing Activities'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    flow_type = models.CharField(max_length=20, choices=FLOW_TYPES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Positive for inflow, negative for outflow
    transaction_date = models.DateField()
    reference_id = models.CharField(max_length=100, blank=True)  # Sale ID, Purchase ID, etc.
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.flow_type}: {self.description} - ${self.amount}"

class Budget(models.Model):
    """Budget planning and tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    period = models.ForeignKey(FinancialPeriod, on_delete=models.CASCADE)
    
    # Revenue Budgets
    budgeted_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    actual_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Expense Budgets
    budgeted_cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    actual_cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    budgeted_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    actual_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def sales_variance(self):
        return self.actual_sales - self.budgeted_sales
    
    @property
    def expense_variance(self):
        return self.actual_expenses - self.budgeted_expenses
    
    def __str__(self):
        return f"Budget: {self.name}"

class PaymentTerm(models.Model):
    """Payment terms for suppliers and customers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)  # "Net 30", "Cash on Delivery", etc.
    days = models.PositiveIntegerField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_days = models.PositiveIntegerField(default=0)  # Early payment discount period
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class AccountsReceivable(models.Model):
    """Track money owed by customers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey('Sales.Customer', on_delete=models.CASCADE)
    sale = models.ForeignKey('Sales.Sale', on_delete=models.CASCADE)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    is_overdue = models.BooleanField(default=False)
    payment_terms = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def check_overdue(self):
        """Check if payment is overdue"""
        self.is_overdue = timezone.now().date() > self.due_date
        self.save()
    
    def __str__(self):
        return f"AR: {self.customer} - ${self.outstanding_amount}"

class AccountsPayable(models.Model):
    """Track money owed to suppliers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey('Purchases.Supplier', on_delete=models.CASCADE)
    purchase = models.ForeignKey('Purchases.Purchase', on_delete=models.CASCADE)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    is_overdue = models.BooleanField(default=False)
    payment_terms = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def check_overdue(self):
        """Check if payment is overdue"""
        self.is_overdue = timezone.now().date() > self.due_date
        self.save()
    
    def __str__(self):
        return f"AP: {self.supplier.name} - ${self.outstanding_amount}"

class FinancialReport(models.Model):
    """Automated financial report generation"""
    REPORT_TYPES = [
        ('PROFIT_LOSS', 'Profit & Loss Statement'),
        ('BALANCE_SHEET', 'Balance Sheet'),
        ('CASH_FLOW', 'Cash Flow Statement'),
        ('SALES_SUMMARY', 'Sales Summary'),
        ('EXPENSE_SUMMARY', 'Expense Summary'),
        ('TAX_REPORT', 'Tax Report'),
        ('INVENTORY_VALUATION', 'Inventory Valuation'),
    ]
    
    PERIOD_TYPES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
        ('CUSTOM', 'Custom Period'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES)
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Financial metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gross_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Additional metrics
    total_sales_count = models.PositiveIntegerField(default=0)
    average_sale_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    customer_count = models.PositiveIntegerField(default=0)
    
    # Report data (JSON format for flexibility)
    report_data = models.JSONField(default=dict)
    
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def generate_profit_loss(self):
        """Generate profit and loss data"""
        from Sales.models import Sale
        from Purchases.models import Purchase
        
        # Calculate revenue
        sales = Sale.objects.filter(
            pharmacy=self.pharmacy,
            created_at__date__range=[self.start_date, self.end_date]
        )
        self.total_revenue = sum(sale.total_amount for sale in sales)
        self.total_sales_count = sales.count()
        
        if self.total_sales_count > 0:
            self.average_sale_value = self.total_revenue / self.total_sales_count
        
        # Calculate expenses
        expenses = Expense.objects.filter(
            pharmacy=self.pharmacy,
            expense_date__range=[self.start_date, self.end_date]
        )
        self.total_expenses = sum(expense.total_amount for expense in expenses)
        
        # Calculate profits
        self.gross_profit = self.total_revenue - self.total_expenses
        self.net_profit = self.gross_profit  # Simplified for now
        
        if self.total_revenue > 0:
            self.profit_margin = (self.net_profit / self.total_revenue) * 100
        
        self.save()
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.start_date} to {self.end_date}"


class BudgetPlan(models.Model):
    """Budget planning and variance analysis"""
    BUDGET_TYPES = [
        ('REVENUE', 'Revenue Budget'),
        ('EXPENSE', 'Expense Budget'),
        ('CAPITAL', 'Capital Expenditure Budget'),
        ('CASH_FLOW', 'Cash Flow Budget'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    budget_name = models.CharField(max_length=100)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPES)
    period_start = models.DateField()
    period_end = models.DateField()
    total_budgeted = models.DecimalField(max_digits=15, decimal_places=2)
    total_actual = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_budgets')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def variance(self):
        """Calculate budget variance"""
        return self.total_actual - self.total_budgeted
    
    @property
    def variance_percentage(self):
        """Calculate variance as percentage"""
        if self.total_budgeted > 0:
            return (self.variance / self.total_budgeted) * 100
        return 0
    
    @property
    def is_over_budget(self):
        """Check if over budget"""
        return self.total_actual > self.total_budgeted
    
    def approve(self, user):
        """Approve the budget"""
        self.is_approved = True
        self.approved_by = user
        self.save()
    
    def __str__(self):
        return f"{self.budget_name} - {self.get_budget_type_display()}"


class BudgetLineItem(models.Model):
    """Individual budget line items"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(BudgetPlan, on_delete=models.CASCADE, related_name='line_items')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE, null=True, blank=True)
    description = models.CharField(max_length=255)
    budgeted_amount = models.DecimalField(max_digits=12, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    
    @property
    def variance(self):
        return self.actual_amount - self.budgeted_amount
    
    @property
    def variance_percentage(self):
        if self.budgeted_amount > 0:
            return (self.variance / self.budgeted_amount) * 100
        return 0
    
    def __str__(self):
        return f"{self.description} - Budgeted: ${self.budgeted_amount}"


class CashFlowForecast(models.Model):
    """Cash flow forecasting"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    forecast_date = models.DateField()
    forecast_period_days = models.PositiveIntegerField(default=30)
    
    # Opening balance
    opening_cash_balance = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Projected inflows
    projected_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    projected_receivables_collection = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_inflows = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_projected_inflows = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Projected outflows
    projected_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    projected_payables_payment = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    projected_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    projected_tax_payments = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    other_outflows = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_projected_outflows = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Projected closing balance
    projected_closing_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    minimum_cash_required = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Analysis
    cash_surplus_deficit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    requires_financing = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def calculate_forecast(self):
        """Calculate cash flow forecast"""
        self.total_projected_inflows = (
            self.projected_sales + self.projected_receivables_collection + self.other_inflows
        )
        
        self.total_projected_outflows = (
            self.projected_purchases + self.projected_payables_payment + 
            self.projected_expenses + self.projected_tax_payments + self.other_outflows
        )
        
        self.projected_closing_balance = (
            self.opening_cash_balance + self.total_projected_inflows - self.total_projected_outflows
        )
        
        self.cash_surplus_deficit = self.projected_closing_balance - self.minimum_cash_required
        self.requires_financing = self.cash_surplus_deficit < 0
        
        self.save()
    
    def __str__(self):
        return f"Cash Flow Forecast - {self.forecast_date}"


class FinancialKPI(models.Model):
    """Key Performance Indicators tracking"""
    KPI_TYPES = [
        ('GROSS_MARGIN', 'Gross Profit Margin'),
        ('NET_MARGIN', 'Net Profit Margin'),
        ('INVENTORY_TURNOVER', 'Inventory Turnover'),
        ('RECEIVABLES_TURNOVER', 'Accounts Receivable Turnover'),
        ('PAYABLES_TURNOVER', 'Accounts Payable Turnover'),
        ('CURRENT_RATIO', 'Current Ratio'),
        ('QUICK_RATIO', 'Quick Ratio'),
        ('ROA', 'Return on Assets'),
        ('ROE', 'Return on Equity'),
        ('DEBT_TO_EQUITY', 'Debt to Equity Ratio'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    kpi_type = models.CharField(max_length=30, choices=KPI_TYPES)
    period_date = models.DateField()
    kpi_value = models.DecimalField(max_digits=10, decimal_places=4)
    target_value = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    industry_benchmark = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def performance_vs_target(self):
        """Compare performance against target"""
        if self.target_value:
            return ((self.kpi_value - self.target_value) / self.target_value) * 100
        return None
    
    @property
    def performance_vs_benchmark(self):
        """Compare performance against industry benchmark"""
        if self.industry_benchmark:
            return ((self.kpi_value - self.industry_benchmark) / self.industry_benchmark) * 100
        return None
    
    class Meta:
        unique_together = ['pharmacy', 'kpi_type', 'period_date']
        ordering = ['-period_date']
    
    def __str__(self):
        return f"{self.get_kpi_type_display()} - {self.kpi_value}"


class TaxCalculation(models.Model):
    """Tax calculations and compliance"""
    TAX_PERIODS = [
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey('Pharmacy.Pharmacy', on_delete=models.CASCADE)
    tax_period = models.CharField(max_length=20, choices=TAX_PERIODS)
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Sales tax
    total_taxable_sales = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    sales_tax_collected = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Purchase tax  
    total_taxable_purchases = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    purchase_tax_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Net tax liability
    net_tax_liability = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_refund_due = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Filing information
    is_filed = models.BooleanField(default=False)
    filed_date = models.DateField(null=True, blank=True)
    filing_reference = models.CharField(max_length=100, blank=True)
    
    calculated_at = models.DateTimeField(auto_now_add=True)
    calculated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def calculate_tax_liability(self):
        """Calculate net tax liability"""
        self.net_tax_liability = self.sales_tax_collected - self.purchase_tax_paid
        if self.net_tax_liability < 0:
            self.tax_refund_due = abs(self.net_tax_liability)
            self.net_tax_liability = 0
        self.save()
    
    def file_return(self, filing_reference=''):
        """Mark tax return as filed"""
        self.is_filed = True
        self.filed_date = timezone.now().date()
        self.filing_reference = filing_reference
        self.save()
    
    def __str__(self):
        return f"Tax Calculation - {self.period_start} to {self.period_end}"
