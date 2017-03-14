/**
 * Created by rerobins on 9/29/15.
 */


angular.module('gnucash-reports-view.reports')
    .directive('gnucashBudgetPlanning', BudgetPlanningDirectiveGenerator);

BudgetPlanningDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function BudgetPlanningDirectiveGenerator($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_planning/budgetPlanningDirective.html',
        link: link
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    function link($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'pieChart',
                height: 350,
                x: function(d){return d.name;},
                y: function(d){return d.value;},
                showLabels: true,
                transitionDuration: 0,
                labelThreshold: 0.01,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 20,
                        left: 0
                    }
                },
                labelType: 'value',
                donut: true,
                labelsOutside: true,
                valueFormat: formatters.currency,
                labelSunbeamLayout: true
            }
        };

        $scope.income = data.income;
        $scope.total = data.income - data.remaining;
        $scope.remaining = data.remaining;
        $scope.budget = angular.copy(data.categories);
        $scope.data = angular.copy(data.categories);

        // Manipulate the data set and tye style based on the amount of remaining value that is in the accounts.
        $scope.remainingStyle = {background: colorDefinitions.totalGood};
        if ($scope.remaining < 0) {
            $scope.remainingStyle = {background: colorDefinitions.totalBad};
        } else {
            $scope.data.push({name: 'Remaining', value: data.remaining});
        }
    }
}
