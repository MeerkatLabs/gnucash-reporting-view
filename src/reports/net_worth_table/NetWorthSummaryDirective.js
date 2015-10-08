/**
 * Created by rerobins on 10/6/15.
 */
var NetworthSummaryDirectiveGenerator = function() {
    return {
        restrict: 'E',
        scope: {
            assets: '&',
            liabilities: '&',
            netWorth: '&',
            deltas: '&',
            trends: '&'
        },
        templateUrl: 'src/reports/net_worth_table/net_worth_summary.html'
    };
};

angular.module('gnucash-reports-view.reports.net_worth_table')
    .directive('netWorthSummary', [NetworthSummaryDirectiveGenerator]);