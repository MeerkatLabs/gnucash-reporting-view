
angular.module('gnucash-reports-view.reports.credit_usage', ['gnucash-reports-view.reports.base',
                                                          'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('credit_usage', 'src/reports/credit_usage/credit_usage.html');
    }]);
