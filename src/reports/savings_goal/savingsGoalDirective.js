/**
 * Created by rerobins on 9/29/15.
 */
var SavingsGoalDirectiveGenerator = function() {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/savings_goal/savingsGoalDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'bulletChart',
                    transitionDuration: 500
                }
            };

            var graphMargin = 1.1;

            var maximum_value = Math.max(data.goal * graphMargin, data.balance * graphMargin);

            $scope.data =  {
                "title": "Account",
                "subtitle": "US$",
                "ranges": [data.goal, maximum_value],
                "measures": [data.balance],
                "markers": [data.goal]
            };
        }
    };
};

angular.module('gnucash-reports-view.reports.savings_goal')
    .directive('savingsGoal', [SavingsGoalDirectiveGenerator]);