angular.module('gnucash-reports-view.reports.net_worth', ['gnucash-reports-view.reports.base',
    'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('net_worth', 'src/reports/net_worth/net_worth.html');
    }]);
