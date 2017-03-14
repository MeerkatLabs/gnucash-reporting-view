
angular.module('gnucash-reports-view.reports.savings_goal', ['gnucash-reports-view.reports.base'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('savings_goal', 'core/reports/savings_goal/savings_goal.html');
    }]);