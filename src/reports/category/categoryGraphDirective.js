/**
 * Created by rerobins on 9/29/15.
 */
var CategoryGraphDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/category/categoryGraphDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'pieChart',
                    height: 350,
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    showLabels: true,
                    transitionDuration: 0,
                    labelThreshold: 0.01,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 20,
                            left: 0
                        }
                    },
                    labelType: "value",
                    donut: true,
                    labelsOutside: true,
                    valueFormat: formatters.currency,
                    labelSunbeamLayout: true
                }
            };

            $scope.data = data.categories;
        }
    };
};

angular.module('gnucash-reports-view.reports.category')
    .directive('categoryGraph', ['formatters', CategoryGraphDirectiveGenerator]);