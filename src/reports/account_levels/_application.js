angular.module('gnucash-reports-view.reports.account_levels', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('account_levels', 'src/reports/account_levels/account_levels.html');
    }]);