angular.module('gnucash-reports-view.reports.budget_level', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('budget_level', 'src/reports/budget_level/budget_level.html');
    }]);