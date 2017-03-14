/**
 * Directive that will display the account level information on the display.
 */
var AccountLevelDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    /**
     * Translate the values of the data report into something that can be rendered.
     * @param $scope
     */
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
                    key: 'Balance',
                    color: colorDefinitions.info,
                    values : [
                        {
                            label: label,
                            value: data.balance
                        }
                    ]
                },
                {
                    key: 'Underage',
                    color: colorDefinitions.base,
                    values : [
                        {
                            label: label,
                            value: data.good_value - data.balance
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = true;

            if (data.balance < data.error_value) {
                $scope.data[0].color = colorDefinitions.error;
            } else if (data.balance < data.warn_value) {
                $scope.data[0].color = colorDefinitions.warning;
            }

        } else {
            // Build overage Chart
            $scope.data = [
                {
                    "key": 'Goal',
                    "color": colorDefinitions.good,
                    "values" : [
                        {
                            label: label,
                            value: data.good_value
                        }
                    ]
                },
                {
                    key: 'Overage',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: data.balance - data.good_value
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
        templateUrl: 'core/reports/account_levels/accountLevelDirective.html',
        link: function($scope) {
            $timeout(createAccountLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('accountLevel', ['$timeout', 'colorDefinitions', 'formatters', AccountLevelDirectiveGenerator]);