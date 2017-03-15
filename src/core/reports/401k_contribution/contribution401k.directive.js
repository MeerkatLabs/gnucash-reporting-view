/**
 * Graph generator that will show progress of gathering money for 401k values.  This is similar to the budget graph
 * except excess over the days current value is shown as green, as opposed to a warning.  Excess over the years value
 * is still shown as an error value.
 */
(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashContribution401k', Contribution401kDirectiveGenerator);


    Contribution401kDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function Contribution401kDirectiveGenerator($timeout, colorDefinitions, formatters) {



        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/401k_contribution/401k_reportDirective.html',
            link: function($scope) {
                $timeout(create401kContributionGraph, 0, true, $scope);
            }
        };

        function create401kContributionGraph($scope) {
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
                        key: 'Today',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: data.contributionLimit
                            }
                        ]
                    },
                    {
                        key: 'Contribution Overage',
                        color: colorDefinitions.error,
                        values: [
                            {
                                label: label,
                                value: data.contribution - data.contributionLimit
                            }
                        ]
                    }
                ];
                $scope.options.chart.stacked = false;
            } else if (data.contribution > todayValue) {
                // Build underage Chart
                $scope.data = [
                    {
                        key: 'Today',
                        color: colorDefinitions.good,
                        values: [
                            {
                                label: label,
                                value: todayValue
                            }
                        ]
                    },
                    {
                        key: 'Today Overage',
                        color: colorDefinitions.best,
                        values: [
                            {
                                label: label,
                                value: data.contribution - todayValue
                            }
                        ]
                    },
                    {
                        key: 'Budget Remaining',
                        color: colorDefinitions.base,
                        values: [
                            {
                                label: label,
                                value: data.contributionLimit - data.contribution
                            }
                        ]
                    }
                ];

                $scope.options.chart.stacked = true;
            } else {
                // Build underage Chart
                $scope.data = [
                    {
                        key: 'Balance',
                        color: colorDefinitions.best,
                        values : [
                            {
                                label: label,
                                value: data.contribution
                            }
                        ]
                    },
                    {
                        key: 'Today',
                        color: colorDefinitions.warning,
                        values: [
                            {
                                label: label,
                                value: todayValue - data.contribution
                            }
                        ]
                    },
                    {
                        key: 'Today Budget Remaining',
                        color: colorDefinitions.base,
                        values: [
                            {
                                label: label,
                                value: data.contributionLimit - todayValue
                            }
                        ]
                    }
                ];

                $scope.options.chart.stacked = true;
            }
        }

    }

})();

