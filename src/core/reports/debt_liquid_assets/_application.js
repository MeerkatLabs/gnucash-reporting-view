
angular.module('gnucash-reports-view.reports.debt_liquid_assets', ['gnucash-reports-view.reports.base',
                                                          'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('debt_vs_liquid_assets', 'src/reports/debt_liquid_assets/debt_liquid_assets.html');
    }]);
