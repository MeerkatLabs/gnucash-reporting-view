/**
 * Created by rerobins on 9/29/15.
 */
var BudgetlevelDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createDataSet = function(budgetValue, balance, currentDay, daysInPeriod) {
        var label = formatters.currency(budgetValue);

        var todayValue = (currentDay / daysInPeriod) * budgetValue;

        var data = null;

        if (balance > budgetValue) {
            data = [
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values : [
                        {
                            label: label,
                            value: todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Remaining Today',
                    color: colorDefinitions.base,
                    values : [
                        {
                            label: label,
                            value: budgetValue - todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Overage',
                    color: colorDefinitions.error,
                    values : [
                        {
                            label: label,
                            value: balance - budgetValue
                        }
                    ]
                }
            ];
        } else if (balance > todayValue) {
            // Build underage Chart
            data = [
                {
                    key: 'Today',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: todayValue
                        }
                    ]
                },
                {
                    key: 'Today Overage',
                    color: colorDefinitions.warning,
                    values : [
                        {
                            label: label,
                            value: balance - todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: budgetValue - balance
                        }
                    ]
                }
            ];

        } else {
            // Build overage Chart
            data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: balance
                        }
                    ]
                },
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values : [
                        {
                            label: label,
                            value: todayValue - balance
                        }
                    ]
                },
                {
                    key : 'Today Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: budgetValue - todayValue
                        }
                    ]
                }
            ];
        }

        return data;
    };

    var createBudgetLevelGraph = function($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                stacked: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }
            }
        };

        $scope.data = createDataSet(data.budgetValue, data.balance, data.today, data.daysInMonth);
        $scope.yearData = createDataSet(data.budgetValue * 12, data.yearlyBalance, data.currentYearDay, data.daysInYear);

    };



    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_level/budgetLevelDirective.html',
        link: function($scope) {
            $timeout(createBudgetLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('gnucashBudgetLevel', ['$timeout', 'colorDefinitions', 'formatters', BudgetlevelDirectiveGenerator]);