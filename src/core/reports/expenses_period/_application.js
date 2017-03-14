angular.module('gnucash-reports-view.reports.expenses_period', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('expenses_period', 'src/reports/expenses_period/expenses_period.html');
    }]);