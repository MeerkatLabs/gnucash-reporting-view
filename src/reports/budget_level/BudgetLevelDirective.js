/**
 * Created by rerobins on 9/29/15.
 */
var BudgetlevelDirectiveGenerator = function($timeout, formatters) {

    //"ranges": [data.error_value, data.warn_value, data.good_value], data.balance

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

        var label = formatters.currency(data.budgetValue);

        var todayValue = (data.today / data.daysInMonth) * data.budgetValue;

        if (data.balance > data.budgetValue) {
            $scope.data = [
                {
                    "key": "Today",
                    "color": "Green",
                    "values" : [
                        {
                            "label": label,
                            "value": todayValue
                        }
                    ]
                },
                {
                    "key": "Budget Remaining Today",
                    "color": "LightSteelBlue",
                    "values" : [
                        {
                            "label": label,
                            "value": data.budgetValue - todayValue
                        }
                    ]
                },
                {
                    "key": "Budget Overage",
                    "color": "LightCoral",
                    "values" : [
                        {
                            "label": label,
                            "value": data.balance - data.budgetValue
                        }
                    ]
                }
            ];
        } else if (data.balance > todayValue) {
            // Build underage Chart
            $scope.data = [
                {
                    "key": "Today",
                    "color": "DarkSeaGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": todayValue
                        }
                    ]
                },
                {
                    "key": "Today Overage",
                    "color": "SandyBrown",
                    "values" : [
                        {
                            "label": label,
                            "value": data.balance - todayValue
                        }
                    ]
                },
                {
                    "key" : "Budget Remaining",
                    "color": "LightSteelBlue",
                    "values": [
                        {
                            "label": label,
                            "value": data.budgetValue - data.balance
                        }
                    ]
                }
            ];

        } else {
            // Build overage Chart
            $scope.data = [
                {
                    "key": "Balance",
                    "color": "ForestGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": data.balance
                        }
                    ]
                },
                {
                    "key": "Today",
                    "color": "DarkSeaGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": todayValue - data.balance
                        }
                    ]
                },
                {
                    "key" : "Today Budget Remaining",
                    "color": "LightSteelBlue",
                    "values": [
                        {
                            "label": label,
                            "value": data.budgetValue - todayValue
                        }
                    ]
                }
            ];
        }
    };



    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/budget_level/budgetLevelDirective.html',
        link: function($scope) {
            $timeout(createBudgetLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.budget_level')
    .directive('budgetLevel', ['$timeout', 'formatters', BudgetlevelDirectiveGenerator]);