angular.module('gnucash-reports-view.reports.401k_contribution', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('401k_report', 'src/reports/401k_contribution/401k_report.html');
    }]);