/**
 * Created by rerobins on 9/29/15.
 */
var CategoryGraphDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

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
                key: '',
                color: colorDefinitions.base,
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
        $scope.total = 0;

        data.categories.forEach(function(d) {
            $scope.total += d[1];
        });
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/category/categoryGraphDirective.html',
        link: function($scope) {
            $timeout(createCategoryChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('categoryGraph', ['$timeout', 'colorDefinitions', 'formatters', CategoryGraphDirectiveGenerator]);