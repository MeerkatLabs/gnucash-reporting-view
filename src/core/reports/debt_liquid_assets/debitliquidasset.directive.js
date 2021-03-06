(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashDebtLiquidAsset', DebtLiquidAssetDirectiveGenerator);

    DebtLiquidAssetDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function DebtLiquidAssetDirectiveGenerator($timeout, colorDefinitions, formatters) {

        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/debt_liquid_assets/debtLiquidAssetDirective.html',
            link: function($scope) {
                $timeout(createDebitLiquidAssetChart, 0, true, $scope);
            }
        };

        function createDebitLiquidAssetChart($scope) {
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

            var label = 'Credit vs. LA';

            if (data.liquid_assets > data.credit_used) {
                $scope.data = [
                    {
                        key: 'Credit Used',
                        color: colorDefinitions.warning,
                        values: [
                            {
                                label: label,
                                value: data.credit_used
                            }
                        ]
                    },
                    {
                        key: 'Liquid Assets',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.liquid_assets - data.credit_used
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = true;
            } else {
                $scope.data = [

                    {
                        key: 'Liquid Assets',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.liquid_assets
                            }
                        ]
                    },
                    {
                        key: 'Overage',
                        color: colorDefinitions.error,
                        values: [
                            {
                                label: label,
                                value: data.credit_used - data.liquid_assets
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = false;
            }

        }

    }

})();