/**
 * Created by rerobins on 9/29/15.
 */
var CategoryGraphDirectiveGenerator = function($timeout, formatters) {

    var createCategoryChart = function($scope) {
        var data = $scope.reportData();
        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showLegend: false,
                showValues: true,
                transitionDuration: 500,
                xAxis: {
                    showMaxMin: false
                },
                margin: {
                    left: 100,
                    right: 50
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return formatters.currency(d);
                    }
                }
            }
        };

        $scope.data = [
            {
                "key": "",
                values: function() {
                    var result = [];

                    data.categories.forEach(function(d) {
                       result.push({
                           label: d[0],
                           value: d[1]
                       });
                    });

                    return result;
                }()
            }
        ];

        $scope.tableData = data.categories;
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/category/categoryGraphDirective.html',
        link: function($scope) {
            //var data = $scope.reportData();
            //
            //$timeout(function() {
            //    $scope.options = {
            //        chart: {
            //            type: 'pieChart',
            //            height: 350,
            //            x: function(d){return d[0];},
            //            y: function(d){return d[1];},
            //            showLabels: true,
            //            transitionDuration: 0,
            //            labelThreshold: 0.01,
            //            legend: {
            //                margin: {
            //                    top: 5,
            //                    right: 35,
            //                    bottom: 20,
            //                    left: 0
            //                }
            //            },
            //            labelType: "value",
            //            donut: true,
            //            labelsOutside: true,
            //            valueFormat: formatters.currency,
            //            labelSunbeamLayout: true
            //        }
            //    };
            //
            //    $scope.data = data.categories;
            //});
            $timeout(createCategoryChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.category')
    .directive('categoryGraph', ['$timeout', 'formatters', CategoryGraphDirectiveGenerator]);