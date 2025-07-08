from django.contrib import admin
from .models import (
    TaxConfiguration, ExpenseCategory, Expense, FinancialPeriod, 
    ProfitLossStatement, CashFlow, Budget, PaymentTerm, AccountsReceivable,
    AccountsPayable, FinancialReport, BudgetPlan, BudgetLineItem,
    CashFlowForecast, FinancialKPI, TaxCalculation
)

# Basic admin registrations to fix model field issues
admin.site.register(TaxConfiguration)
admin.site.register(ExpenseCategory)
admin.site.register(Expense)
admin.site.register(FinancialPeriod)
admin.site.register(ProfitLossStatement)
admin.site.register(CashFlow)
admin.site.register(Budget)
admin.site.register(PaymentTerm)
admin.site.register(AccountsReceivable)
admin.site.register(AccountsPayable)
admin.site.register(FinancialReport)
admin.site.register(BudgetPlan)
admin.site.register(BudgetLineItem)
admin.site.register(CashFlowForecast)
admin.site.register(FinancialKPI)
admin.site.register(TaxCalculation)
