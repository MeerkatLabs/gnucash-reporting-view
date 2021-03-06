(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashSavingsGoal', SavingsGoalDirectiveGenerator);

    SavingsGoalDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function SavingsGoalDirectiveGenerator($timeout, colorDefinitions, formatters) {

        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/savings_goal/savingsGoalDirective.html',
            link: function($scope) {
                $timeout(createSavingsGoalChart, 0, true, $scope);
            }
        };

        function createSavingsGoalChart($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'multiBarHorizontalChart',
                    transitionDuration: 0,
                    tooltip: {
                        valueFormatter: formatters.currency
                    },
                    tickFormat: formatters.currencyNoParts,
                    x: function (d) {
                        return d.label;
                    },
                    y: function (d) {
                        return d.value;
                    },
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

            var label = formatters.currency(data.goal);

            if (data.balance < data.goal) {
                // Build underage Chart
                $scope.data = [
                    {
                        key: 'Balance',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.balance
                            }
                        ]
                    },
                    {
                        key: 'To Go',
                        color: colorDefinitions.error,
                        values: [
                            {
                                label: label,
                                value: data.goal - data.balance
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = true;
            } else {
                // Build overage Chart
                $scope.data = [
                    {
                        key: 'Goal',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.goal
                            }
                        ]
                    },
                    {
                        key: 'Overage',
                        color: colorDefinitions.best,
                        values: [
                            {
                                label: label,
                                value: data.balance - data.goal
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = false;
            }

        }
    }
})();