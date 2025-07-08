from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaxConfigurationViewSet, ExpenseCategoryViewSet, ExpenseViewSet,
    FinancialPeriodViewSet, ProfitLossStatementViewSet, CashFlowViewSet,
    BudgetViewSet, PaymentTermViewSet, AccountsReceivableViewSet,
    AccountsPayableViewSet, FinancialReportViewSet, BudgetPlanViewSet,
    BudgetLineItemViewSet, CashFlowForecastViewSet, FinancialKPIViewSet,
    TaxCalculationViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'tax-configurations', TaxConfigurationViewSet, basename='tax-configurations')
router.register(r'expense-categories', ExpenseCategoryViewSet, basename='expense-categories')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'financial-periods', FinancialPeriodViewSet, basename='financial-periods')
router.register(r'profit-loss-statements', ProfitLossStatementViewSet, basename='profit-loss-statements')
router.register(r'cash-flows', CashFlowViewSet, basename='cash-flows')
router.register(r'budgets', BudgetViewSet, basename='budgets')
router.register(r'payment-terms', PaymentTermViewSet, basename='payment-terms')
router.register(r'accounts-receivable', AccountsReceivableViewSet, basename='accounts-receivable')
router.register(r'accounts-payable', AccountsPayableViewSet, basename='accounts-payable')
router.register(r'reports', FinancialReportViewSet, basename='financial-reports')
router.register(r'budget-plans', BudgetPlanViewSet, basename='budget-plans')
router.register(r'budget-line-items', BudgetLineItemViewSet, basename='budget-line-items')
router.register(r'cash-flow-forecasts', CashFlowForecastViewSet, basename='cash-flow-forecasts')
router.register(r'kpis', FinancialKPIViewSet, basename='financial-kpis')
router.register(r'tax-calculations', TaxCalculationViewSet, basename='tax-calculations')
router.register(r'dashboard', DashboardViewSet, basename='finance-dashboard')

urlpatterns = [
    path('api/finance/', include(router.urls)),
]
