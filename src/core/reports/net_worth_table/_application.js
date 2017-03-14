angular.module('gnucash-reports-view.reports.net_worth_table', ['gnucash-reports-view.reports.base',
    'md.data.table', 'ngMaterial'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('net_worth_table', 'core/reports/net_worth_table/net_worth_table.html');
    }]);
