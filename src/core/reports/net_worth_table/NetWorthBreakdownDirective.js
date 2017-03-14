/**
 * Created by rerobins on 10/6/15.
 */
var NetworthBreakdownDirectiveGenerator = function(formatters) {
    return {
        restrict: 'E',
        scope: {
            data: '&',
            deltas: '&',
            trends: '&',
            header: '&'
        },
        templateUrl: 'core/reports/net_worth_table/net_worth_breakdown.html'
    };
};

angular.module('gnucash-reports-view.reports.net_worth_table')
    .directive('netWorthBreakdown', ['formatters', NetworthBreakdownDirectiveGenerator]);