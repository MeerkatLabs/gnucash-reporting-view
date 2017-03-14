(function() {

    /**
     * Created by rerobins on 9/29/15.
     */
    angular.module('gnucash-reports-view.reports')
        .directive('gnucashBoxPlot', BoxPlotDirectiveGenerator);

    BoxPlotDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function BoxPlotDirectiveGenerator($timeout, colorDefinitions, formatters) {

        return {
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/box_plot/boxPlotDirective.html',
            link: function($scope) {
                $timeout(buildChartConfiguration, 0, true, $scope);
            }
        };

        function buildChartConfiguration($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'boxPlotChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 100
                    },
                    color:[colorDefinitions.base],
                    x: function(d){return d.label;},
                    maxBoxWidth: 75,
                    yDomain: [0, data.high],
                    yAxis: {
                        tickFormat: formatters.currencyNoParts
                    },
                    transitionDuration: 0
                }
            };

            $scope.data = [
                {
                    label: 'Data',
                    values: {
                        Q1: data.q1,
                        Q2: data.q2,
                        Q3: data.q3,
                        whisker_low: data.low,
                        whisker_high: data.high,
                        outliers: []
                    }
                }
            ];
        }
    }

})();