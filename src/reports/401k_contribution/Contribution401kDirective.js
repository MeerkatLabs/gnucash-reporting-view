/**
 * Created by rerobins on 9/29/15.
 */
var Contribution401kDirectiveGenerator = function($timeout, formatters) {

    var create401kContributionGraph = function($scope) {
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

        var label = formatters.currency(data.contributionLimit);

        var todayValue = (data.dayOfYear / data.daysInYear) * data.contributionLimit;

        if (data.contribution > data.contributionLimit) {
            $scope.data = [
                {
                    "key": "Today",
                    "color": "Green",
                    "values" : [
                        {
                            "label": label,
                            "value": data.contributionLimit
                        }
                    ]
                },
                {
                    "key": "Contribution Overage",
                    "color": "LightCoral",
                    "values" : [
                        {
                            "label": label,
                            "value": data.contribution - data.contributionLimit
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        } else if (data.contribution > todayValue) {
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
                    "color": "ForestGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": data.contribution - todayValue
                        }
                    ]
                },
                {
                    "key" : "Budget Remaining",
                    "color": "LightSteelBlue",
                    "values": [
                        {
                            "label": label,
                            "value": data.contributionLimit - data.contribution
                        }
                    ]
                }
            ];

            $scope.options.chart.stacked = true;
        } else {
            // Build underage Chart
            $scope.data = [
                {
                    "key": "Balance",
                    "color": "ForestGreen",
                    "values" : [
                        {
                            "label": label,
                            "value": data.contribution
                        }
                    ]
                },
                {
                    "key": "Today",
                    "color": "Khaki",
                    "values" : [
                        {
                            "label": label,
                            "value": todayValue - data.contribution
                        }
                    ]
                },
                {
                    "key" : "Today Budget Remaining",
                    "color": "LightSteelBlue",
                    "values": [
                        {
                            "label": label,
                            "value": data.contributionLimit - todayValue
                        }
                    ]
                }
            ];

            $scope.options.chart.stacked = true;
        }
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/401k_contribution/401k_reportDirective.html',
        link: function($scope) {
            $timeout(create401kContributionGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('contribution401k', ['$timeout', 'formatters', Contribution401kDirectiveGenerator]);