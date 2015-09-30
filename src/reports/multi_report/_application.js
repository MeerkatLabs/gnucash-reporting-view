angular.module('gnucash-reports-view.reports.multi_report', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('multi_report', 'src/reports/multi_report/multi_report.html');
    }]);