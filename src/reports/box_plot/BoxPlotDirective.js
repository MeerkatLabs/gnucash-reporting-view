/**
 * Created by rerobins on 9/29/15.
 */
var BoxPlotDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/box_plot/boxPlotDirective.html',
        link: function($scope) {
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
                    color:['darkblue', 'darkorange', 'green', 'darkred', 'darkviolet'],
                    x: function(d){return d.label;},
                    maxBoxWidth: 75,
                    yDomain: [0, data.high],
                    yAxis: {
                        tickFormat: formatters.currencyNoParts
                    },

                }
            };

            $scope.data = [
                {
                    label: "Data",
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
    };
};

angular.module('gnucash-reports-view.reports.box_plot')
    .directive('boxPlot', ['formatters', BoxPlotDirectiveGenerator]);