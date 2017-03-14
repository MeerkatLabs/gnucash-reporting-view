angular.module('gnucash-reports-view.reports.investment_balance', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('investment_balance', 'src/reports/investment_balance/investment_balance.html');
    }]);