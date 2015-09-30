angular.module('gnucash-reports-view.reports.cash_flow', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('monthly_cash_flow_chart', 'src/reports/cash_flow_chart/cash_flow.html');
    }]);