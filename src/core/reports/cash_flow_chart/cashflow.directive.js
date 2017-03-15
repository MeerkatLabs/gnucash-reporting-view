(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashCashFlow', CashFlowDirectiveGenerator);

    CashFlowDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function CashFlowDirectiveGenerator($timeout, colorDefinitions, formatters) {
        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/cash_flow_chart/cashFlowDirective.html',
            link: link
        };

        ///////////////////////////////////////////////////////////

        function link($scope) {
            var data = $scope.reportData();

            $timeout(function() {
                $scope.options = {
                    chart: {
                        type: 'multiBarChart',
                        height: 450,
                        margin : {
                            top: 20,
                            right: 20,
                            bottom: 100,
                            left: 100
                        },
                        x: function(d){return d.date;},
                        y: function(d){return d.value;},
                        showControls: false,
                        showValues: true,
                        valueFormat: formatters.currency,
                        stacked: true,
                        transitionDuration: 0,
                        xAxis: {
                            axisLabel: 'Date',
                            tickFormat: formatters.date,
                            rotateLabels: 35,
                            showMaxMin: false
                        },
                        yAxis: {
                            axisLabel: 'USD',
                            axisLabelDistance: 35,
                            tickFormat: formatters.currencyNoParts
                        }
                    }
                };

                data.debits.forEach(function(dataValue) {
                    if (dataValue.value === 0) {
                        // TODO: Figure out how to do this so that it doesn't display as -0.0001 in the graph.
                        dataValue.value = -0.00001;
                    }
                });


                $scope.data = [
                    {
                        key: 'Credits',
                        bar: true,
                        color: colorDefinitions.credit,
                        values: data.credits
                    },
                    {
                        key: 'Debits',
                        bar: true,
                        color: colorDefinitions.debit,
                        values: data.debits
                    }
                ];
            });
        }
    }

})();