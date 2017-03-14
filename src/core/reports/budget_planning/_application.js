
angular.module('gnucash-reports-view.reports.budget_planning', ['gnucash-reports-view.reports.base',
                                                                'nvd3', 'md.data.table', 'ngMaterial'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('budget_planning', 'src/reports/budget_planning/budget_planning.html');
    }]);
