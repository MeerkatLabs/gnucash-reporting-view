/**
 * Created by rerobins on 9/29/15.
 */
var CreditUsageDirectiveGenerator = function($timeout, formatters) {

    var createCreditUsageChart = function($scope) {
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
                stacked: true,
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

        var label = formatters.currency(data.credit_limit);

        $scope.data = [
            {
                key: "Used",
                values: [
                    {
                        label: label,
                        value: data.credit_amount
                    }
                ]
            },
            {
                key: "Available",
                values: [
                    {
                        label: label,
                        value: data.credit_limit - data.credit_amount
                    }
                ]
            }
        ];
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/credit_usage/creditUsageDirective.html',
        link: function($scope) {
            $timeout(createCreditUsageChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.credit_usage')
    .directive('creditUsage', ['$timeout', 'formatters', CreditUsageDirectiveGenerator]);