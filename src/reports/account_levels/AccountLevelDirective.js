/**
 * Created by rerobins on 9/29/15.
 */
var AccountLevelDirectiveGenerator = function($timeout, formatters) {

    //"ranges": [data.error_value, data.warn_value, data.good_value], data.balance

    var createAccountLevelGraph = function($scope) {
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

        var label = formatters.currency(data.good_value);

        if (data.balance < data.good_value) {
            // Build underage Chart
            $scope.data = [
                {
                    "key": "Balance",
                    "color": "Khaki",
                    "values" : [
                        {
                            "label": label,
                            "value": data.balance
                        }
                    ]
                },
                {
                    "key": "Underage",
                    "color": "LightSteelBlue",
                    "values" : [
                        {
                            "label": label,
                            "value": data.good_value - data.balance
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = true;

            if (data.balance < data.error_value) {
                $scope.data[0].color = 'LightCoral';
            } else if (data.balance < data.warn_value) {
                $scope.data[0].color = 'SandyBrown';
            }

        } else {
            // Build overage Chart
            $scope.data = [
                {
                    "key": "Goal",
                    "color": "DarkSeaGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": data.good_value
                        }
                    ]
                },
                {
                    "key": "Overage",
                    "color": "ForestGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": data.balance - data.good_value
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        }
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/account_levels/accountLevelDirective.html',
        link: function($scope) {
            $timeout(createAccountLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('accountLevel', ['$timeout', 'formatters', AccountLevelDirectiveGenerator]);