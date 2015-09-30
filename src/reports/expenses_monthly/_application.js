angular.module('gnucash-reports-view.reports.expenses_monthly', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('expenses_monthly', 'src/reports/expenses_monthly/expenses_monthly.html');
    }]);