(function() {

    /**
     * Register all of the core reports into the data system.
     */
    angular.module('gnucash-reports-view.reports')
        .config(['ReportsManagementProvider', function(provider) {
            provider.addTemplate('401k_report', 'core/reports/401k_contribution/401k_report.html')
                .addTemplate('account_levels', 'core/reports/account_levels/account_levels.html')
                .addTemplate('expenses_box', 'core/reports/box_plot/box_plot.html')
                .addTemplate('budget_level', 'core/reports/budget_level/budget_level.html')
                .addTemplate('category_budget_level', 'core/reports/budget_level/budget_level.html')
                .addTemplate('budget_planning', 'core/reports/budget_planning/budget_planning.html')
                .addTemplate('cash_flow', 'core/reports/cash_flow_chart/cash_flow.html')
                .addTemplate('account_usage_categories', 'core/reports/category/category.html')
                .addTemplate('expenses_categories', 'core/reports/category/category.html')
                .addTemplate('investment_allocation', 'core/reports/category/category.html')
                .addTemplate('expense_accounts', 'core/reports/category/category.html')
                .addTemplate('credit_usage', 'core/reports/credit_usage/credit_usage.html')
                .addTemplate('debt_vs_liquid_assets', 'core/reports/debt_liquid_assets/debt_liquid_assets.html')
                .addTemplate('expenses_period', 'core/reports/expenses_period/expenses_period.html')
                .addTemplate('income_vs_expense', 'core/reports/income_vs_expense/income_vs_expense.html')
                .addTemplate('investment_balance', 'core/reports/investment_balance/investment_balance.html')
                .addTemplate('investment_trend', 'core/reports/investment_trend/investment_trend.html')
                .addTemplate('multi_report', 'core/reports/multi_report/multi_report.html')
                .addTemplate('net_worth', 'core/reports/net_worth/net_worth.html')
                .addTemplate('net_worth_table', 'core/reports/net_worth_table/net_worth_table.html')
                .addTemplate('savings_goal', 'core/reports/savings_goal/savings_goal.html')
                .addTemplate('income_tax', 'core/reports/taxes_paid/taxes_paid.html');
        }]);

})();