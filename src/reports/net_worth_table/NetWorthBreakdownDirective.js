/**
 * Created by rerobins on 10/6/15.
 */
var NetworthBreakdownDirectiveGenerator = function(formatters) {
    return {
        scope: {
            data: '&',
            deltas: '&',
            trends: '&',
            tableName: '&'
        },
        templateUrl: 'src/reports/net_worth_table/net_worth_breakdown.html',
        link: function($scope) {
            console.log('Scope', $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.net_worth_table')
    .directive('netWorthBreakdown', ['formatters', NetworthBreakdownDirectiveGenerator]);