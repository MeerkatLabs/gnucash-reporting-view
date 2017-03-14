/**
 * Created by rerobins on 10/6/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashNetWorthSummary', NetworthSummaryDirectiveGenerator);

NetworthSummaryDirectiveGenerator.$inject = [];

function NetworthSummaryDirectiveGenerator() {
    return {
        restrict: 'E',
        scope: {
            assets: '&',
            liabilities: '&',
            netWorth: '&',
            deltas: '&',
            trends: '&'
        },
        templateUrl: 'core/reports/net_worth_table/net_worth_summary.html'
    };
}
