from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q, F, Count
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import calendar

from .models import (
    TaxConfiguration, ExpenseCategory, Expense, FinancialPeriod,
    ProfitLossStatement, CashFlow, Budget, PaymentTerm, AccountsReceivable,
    AccountsPayable, FinancialReport, BudgetPlan, BudgetLineItem,
    CashFlowForecast, FinancialKPI, TaxCalculation
)
from .serializers import (
    TaxConfigurationSerializer, ExpenseCategorySerializer, ExpenseSerializer,
    FinancialPeriodSerializer, ProfitLossStatementSerializer, CashFlowSerializer,
    BudgetSerializer, PaymentTermSerializer, AccountsReceivableSerializer,
    AccountsPayableSerializer, FinancialReportSerializer, BudgetPlanSerializer,
    BudgetLineItemSerializer, CashFlowForecastSerializer, FinancialKPISerializer,
    TaxCalculationSerializer, FinancialSummarySerializer, MonthlyFinancialTrendSerializer
)
from Pharmacy.permissions import IsAdminOrPharmacistOwner

class TaxConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = TaxConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = TaxConfiguration.objects.filter(is_active=True)

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ExpenseCategory.objects.filter(is_active=True)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return Expense.objects.filter(pharmacy=user.pharmacy)
        return Expense.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy, recorded_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')
        
        expenses = self.get_queryset().filter(expense_date__year=year)
        if month:
            expenses = expenses.filter(expense_date__month=month)
        
        breakdown = expenses.values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        return Response(breakdown)

class FinancialPeriodViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialPeriodSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return FinancialPeriod.objects.filter(pharmacy=user.pharmacy)
        return FinancialPeriod.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy)

class ProfitLossStatementViewSet(viewsets.ModelViewSet):
    serializer_class = ProfitLossStatementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return ProfitLossStatement.objects.filter(pharmacy=user.pharmacy)
        return ProfitLossStatement.objects.none()

class CashFlowViewSet(viewsets.ModelViewSet):
    serializer_class = CashFlowSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return CashFlow.objects.filter(pharmacy=user.pharmacy)
        return CashFlow.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy, recorded_by=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return Budget.objects.filter(pharmacy=user.pharmacy)
        return Budget.objects.none()

class PaymentTermViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentTermSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PaymentTerm.objects.all()

class AccountsReceivableViewSet(viewsets.ModelViewSet):
    serializer_class = AccountsReceivableSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return AccountsReceivable.objects.filter(sale__pharmacy=user.pharmacy)
        return AccountsReceivable.objects.none()
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        today = timezone.now().date()
        overdue_accounts = self.get_queryset().filter(
            due_date__lt=today,
            outstanding_amount__gt=0
        )
        serializer = self.get_serializer(overdue_accounts, many=True)
        return Response(serializer.data)

class AccountsPayableViewSet(viewsets.ModelViewSet):
    serializer_class = AccountsPayableSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return AccountsPayable.objects.filter(purchase__pharmacy=user.pharmacy)
        return AccountsPayable.objects.none()

class FinancialReportViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return FinancialReport.objects.filter(pharmacy=user.pharmacy)
        return FinancialReport.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy, generated_by=self.request.user)

class BudgetPlanViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetPlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return BudgetPlan.objects.filter(pharmacy=user.pharmacy)
        return BudgetPlan.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy, created_by=self.request.user)

class BudgetLineItemViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetLineItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return BudgetLineItem.objects.filter(budget_plan__pharmacy=user.pharmacy)
        return BudgetLineItem.objects.none()

class CashFlowForecastViewSet(viewsets.ModelViewSet):
    serializer_class = CashFlowForecastSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return CashFlowForecast.objects.filter(pharmacy=user.pharmacy)
        return CashFlowForecast.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy, created_by=self.request.user)

class FinancialKPIViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialKPISerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return FinancialKPI.objects.filter(pharmacy=user.pharmacy)
        return FinancialKPI.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(pharmacy=self.request.user.pharmacy)

class TaxCalculationViewSet(viewsets.ModelViewSet):
    serializer_class = TaxCalculationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pharmacy'):
            return TaxCalculation.objects.filter(pharmacy=user.pharmacy)
        return TaxCalculation.objects.none()

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrPharmacistOwner]
    
    @action(detail=False, methods=['get'])
    def financial_summary(self, request):
        """Get comprehensive financial summary for dashboard"""
        user = request.user
        if not hasattr(user, 'pharmacy'):
            return Response({'error': 'User not associated with a pharmacy'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        pharmacy = user.pharmacy
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        
        # Get current month sales
        from Sales.models import Sale
        monthly_sales = Sale.objects.filter(
            pharmacy=pharmacy,
            created_at__date__range=[current_month_start, today]
        )
        total_revenue = monthly_sales.aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Get current month expenses
        monthly_expenses = Expense.objects.filter(
            pharmacy=pharmacy,
            expense_date__range=[current_month_start, today]
        )
        total_expenses = monthly_expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        # Get cash balance from latest cash flow
        latest_cash_flow = CashFlow.objects.filter(
            pharmacy=pharmacy
        ).order_by('-transaction_date').first()
        cash_balance = latest_cash_flow.amount if latest_cash_flow else 0
        
        # Get outstanding receivables and payables
        outstanding_receivables = AccountsReceivable.objects.filter(
            sale__pharmacy=pharmacy,
            outstanding_amount__gt=0
        ).aggregate(total=Sum('outstanding_amount'))['total'] or 0
        
        outstanding_payables = AccountsPayable.objects.filter(
            purchase__pharmacy=pharmacy,
            outstanding_amount__gt=0
        ).aggregate(total=Sum('outstanding_amount'))['total'] or 0
        
        net_profit = total_revenue - total_expenses
        profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        summary_data = {
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_profit': net_profit,
            'cash_balance': cash_balance,
            'outstanding_receivables': outstanding_receivables,
            'outstanding_payables': outstanding_payables,
            'profit_margin': round(profit_margin, 2)
        }
        
        serializer = FinancialSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        """Get monthly financial trends for the last 12 months"""
        user = request.user
        if not hasattr(user, 'pharmacy'):
            return Response({'error': 'User not associated with a pharmacy'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        pharmacy = user.pharmacy
        today = timezone.now().date()
        twelve_months_ago = today - timedelta(days=365)
        
        trends = []
        current_date = twelve_months_ago.replace(day=1)
        
        while current_date <= today:
            month_end = datetime(current_date.year, current_date.month, 
                               calendar.monthrange(current_date.year, current_date.month)[1]).date()
            
            # Sales for this month
            from Sales.models import Sale
            monthly_sales = Sale.objects.filter(
                pharmacy=pharmacy,
                created_at__date__range=[current_date, month_end]
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Expenses for this month
            monthly_expenses = Expense.objects.filter(
                pharmacy=pharmacy,
                expense_date__range=[current_date, month_end]
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Cash flow for this month - sum positive and negative amounts
            monthly_cash_flow = CashFlow.objects.filter(
                pharmacy=pharmacy,
                transaction_date__range=[current_date, month_end]
            )
            
            cash_in = monthly_cash_flow.filter(amount__gt=0).aggregate(
                total=Sum('amount'))['total'] or 0
            cash_out = abs(monthly_cash_flow.filter(amount__lt=0).aggregate(
                total=Sum('amount'))['total'] or 0)
            
            trends.append({
                'month': current_date.strftime('%Y-%m'),
                'revenue': monthly_sales,
                'expenses': monthly_expenses,
                'profit': monthly_sales - monthly_expenses,
                'cash_flow': cash_in - cash_out
            })
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        serializer = MonthlyFinancialTrendSerializer(trends, many=True)
        return Response(serializer.data)
