angular.module('gnucash-reports-view.reports.income_vs_expense', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('income_vs_expense', 'src/reports/income_vs_expense/income_vs_expense.html');
    }]);