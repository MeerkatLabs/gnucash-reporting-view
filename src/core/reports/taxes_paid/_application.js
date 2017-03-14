angular.module('gnucash-reports-view.reports.taxes_paid', ['gnucash-reports-view.reports.base',
                                                                  'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('income_tax', 'core/reports/taxes_paid/taxes_paid.html');
    }]);