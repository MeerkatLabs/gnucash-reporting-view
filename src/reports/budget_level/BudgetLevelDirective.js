/**
 * Created by rerobins on 9/29/15.
 */
var BudgetlevelDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/budget_level/budgetLevelDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'bulletChart',
                    transitionDuration: 500,
                    tooltip: {
                        valueFormatter: formatters.currency
                    },
                    tickFormat: formatters.currencyNoParts
                }
            };

            var graphMargin = 1.1;

            var maximum_value = Math.max(data.balance * graphMargin,
                                         data.budgetValue * graphMargin);

            var marker = (data.today / data.daysInMonth) * data.budgetValue;


            $scope.data =  {
                "title": "Account",
                "subtitle": "US$",
                "ranges": [data.budgetValue, maximum_value],
                "measures": [data.balance],
                "markers": [marker]
            };
        }
    };
};

angular.module('gnucash-reports-view.reports.budget_level')
    .directive('budgetLevel', ['formatters', BudgetlevelDirectiveGenerator]);