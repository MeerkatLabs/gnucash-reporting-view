/**
 * Created by rerobins on 9/29/15.
 */
var BudgetPlanningDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/budget_planning/budgetPlanningDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'pieChart',
                    height: 350,
                    x: function(d){return d.name;},
                    y: function(d){return d.value;},
                    showLabels: true,
                    transitionDuration: 500,
                    labelThreshold: 0.01,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 20,
                            left: 0
                        }
                    },
                    labelType: "value",
                    donut: true,
                    donutLabelsOutside: true,
                    labelFormat: formatters.currency,
                    labelSunbeamLayout: true
                }
            };

            $scope.income = data.income;
            $scope.total = data.income - data.remaining;
            $scope.remaining = data.remaining;
            $scope.budget = angular.copy(data.categories);
            $scope.data = angular.copy(data.categories);

            // Manipulate the data set and tye style based on the amount of remaining value that is in the accounts.
            $scope.remainingStyle = {background: 'lightcyan'};
            if ($scope.remaining < 0) {
                $scope.remainingStyle = {background: 'lightsalmon'};
            } else {
                $scope.data.push({name: 'Remaining', value: data.remaining});
            }

        }
    };
};

angular.module('gnucash-reports-view.reports.category')
    .directive('budgetPlanning', ['formatters', BudgetPlanningDirectiveGenerator]);