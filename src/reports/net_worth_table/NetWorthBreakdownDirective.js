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
        templateUrl: 'src/reports/net_worth_table/net_worth_breakdown.html',
        link: function($scope) {
            console.log($scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.net_worth_table')
    .directive('netWorthBreakdown', ['formatters', NetworthBreakdownDirectiveGenerator]);