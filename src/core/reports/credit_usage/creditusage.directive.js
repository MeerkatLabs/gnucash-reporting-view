(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashCreditUsage', CreditUsageDirectiveGenerator);

    CreditUsageDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function CreditUsageDirectiveGenerator($timeout, colorDefinitions, formatters) {

        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/credit_usage/creditUsageDirective.html',
            link: function($scope) {
                $timeout(createCreditUsageChart, 0, true, $scope);
            }
        };

        function createCreditUsageChart ($scope) {
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
                    key: 'Used',
                    color: colorDefinitions.debit,
                    values: [
                        {
                            label: label,
                            value: data.credit_amount
                        }
                    ]
                },
                {
                    key: 'Available',
                    color: colorDefinitions.credit,
                    values: [
                        {
                            label: label,
                            value: data.credit_limit - data.credit_amount
                        }
                    ]
                }
            ];
        }

    }

})();