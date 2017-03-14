(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashTaxesPaid', TaxesPaidDirectiveGenerator);

    TaxesPaidDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function TaxesPaidDirectiveGenerator($timeout, colorDefinitions, formatters) {

        return {
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/taxes_paid/taxes_paidDirective.html',
            link: function($scope) {
                $timeout(createTaxesPaidGraph, 0, true, $scope);
            }
        };

        function createTaxesPaidGraph($scope) {
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

            var label = formatters.currency(data.tax_value);

            if (data.taxes_paid > data.tax_value) {
                $scope.data = [
                    {
                        key: 'Taxes Owed',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.tax_value
                            }
                        ]
                    },
                    {
                        key: 'Overpayment',
                        color: colorDefinitions.error,
                        values: [
                            {
                                label: label,
                                value: data.taxes_paid - data.tax_value
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = false;
            } else {
                // Build underage Chart
                $scope.data = [
                    {
                        key: 'Taxes Paid',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.taxes_paid
                            }
                        ]
                    }];

                if (data.tax_value > data.taxes_paid)
                {
                    $scope.data.push({
                        key: 'Taxes Owed',
                        color: colorDefinitions.warning,
                        values: [
                            {
                                label: label,
                                value: data.tax_value - data.taxes_paid
                            }
                        ]
                    });
                }

                $scope.options.chart.stacked = true;
            }
        }

    }

})();