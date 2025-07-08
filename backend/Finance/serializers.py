from rest_framework import serializers
from .models import (
    TaxConfiguration, ExpenseCategory, Expense, FinancialPeriod,
    ProfitLossStatement, CashFlow, Budget, PaymentTerm, AccountsReceivable,
    AccountsPayable, FinancialReport, BudgetPlan, BudgetLineItem,
    CashFlowForecast, FinancialKPI, TaxCalculation
)

class TaxConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxConfiguration
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent_category.name', read_only=True)
    
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['pharmacy', 'recorded_by', 'created_at']

class FinancialPeriodSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = FinancialPeriod
        fields = '__all__'
        read_only_fields = ['pharmacy', 'closed_by', 'closed_at']

class ProfitLossStatementSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    profit_margin = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfitLossStatement
        fields = '__all__'
    
    def get_profit_margin(self, obj):
        if obj.total_revenue > 0:
            return (obj.net_profit / obj.total_revenue) * 100
        return 0

class CashFlowSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    flow_type_display = serializers.CharField(source='get_flow_type_display', read_only=True)
    
    class Meta:
        model = CashFlow
        fields = '__all__'
        read_only_fields = ['pharmacy', 'recorded_by', 'created_at']

class BudgetSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    remaining_budget = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = '__all__'
    
    def get_remaining_budget(self, obj):
        return obj.total_budget - obj.spent_amount
    
    def get_utilization_percentage(self, obj):
        if obj.total_budget > 0:
            return (obj.spent_amount / obj.total_budget) * 100
        return 0

class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = '__all__'

class AccountsReceivableSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    customer_name = serializers.CharField(source='customer.user.username', read_only=True)
    days_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountsReceivable
        fields = '__all__'
    
    def get_days_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date < timezone.now().date():
            return (timezone.now().date() - obj.due_date).days
        return 0

class AccountsPayableSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = AccountsPayable
        fields = '__all__'
    
    def get_days_until_due(self, obj):
        from django.utils import timezone
        if obj.due_date > timezone.now().date():
            return (obj.due_date - timezone.now().date()).days
        return 0

class FinancialReportSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = FinancialReport
        fields = '__all__'
        read_only_fields = ['pharmacy', 'generated_at', 'generated_by']

class BudgetPlanSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True)
    
    class Meta:
        model = BudgetPlan
        fields = '__all__'
        read_only_fields = ['pharmacy', 'created_by', 'created_at', 'approved_by']

class BudgetLineItemSerializer(serializers.ModelSerializer):
    budget_plan_name = serializers.CharField(source='budget_plan.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    variance = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetLineItem
        fields = '__all__'
    
    def get_variance(self, obj):
        return obj.actual_amount - obj.budgeted_amount

class CashFlowForecastSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    net_cash_flow = serializers.SerializerMethodField()
    
    class Meta:
        model = CashFlowForecast
        fields = '__all__'
        read_only_fields = ['pharmacy', 'created_by', 'created_at']
    
    def get_net_cash_flow(self, obj):
        return obj.total_projected_inflows - obj.total_projected_outflows

class FinancialKPISerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = FinancialKPI
        fields = '__all__'
        read_only_fields = ['pharmacy', 'calculated_at']

class TaxCalculationSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = TaxCalculation
        fields = '__all__'

# Summary serializers for dashboard
class FinancialSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    cash_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_receivables = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_payables = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)

class MonthlyFinancialTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    cash_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
