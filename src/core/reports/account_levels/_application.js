/**
 * This is a report that will show the level of a checking/savings account and show warning levels based on the values
 * that are defined.
 */

angular.module('gnucash-reports-view.reports.account_levels', ['gnucash-reports-view.reports.base',
                                                               'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('account_levels', 'core/reports/account_levels/account_levels.html');
    }]);