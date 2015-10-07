/**
 * Created by rerobins on 9/29/15.
 */
var CreditUsageDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/credit_usage/creditUsageDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'pieChart',
                    height: 300,
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    transitionDuration: 0,
                    labelThreshold: 0.01,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    },
                    labelType: "value",
                    donut: true,
                    labelsOutside: true,
                    valueFormat: formatters.currency
                }
            };

            $scope.data = [
                {
                    key: "Available",
                    y: data.credit_limit
                },
                {
                    key: "Used",
                    y: data.credit_amount
                }
            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.credit_usage')
    .directive('creditUsage', ['formatters', CreditUsageDirectiveGenerator]);