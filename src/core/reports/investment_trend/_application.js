angular.module('gnucash-reports-view.reports.investment_trend', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('investment_trend', 'core/reports/investment_trend/investment_trend.html');
    }]);