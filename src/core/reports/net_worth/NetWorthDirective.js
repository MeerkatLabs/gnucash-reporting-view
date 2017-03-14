/**
 * Created by rerobins on 9/29/15.
 */
var NetworthDirectiveGenerator = function($timeout, formatters) {
    return {
        restrict: 'E',
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/net_worth/net_worthDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $timeout(function() {

                $scope.options = {
                    chart: {
                        type: 'lineChart',
                        height: 450,
                        margin : {
                            top: 30,
                            right: 60,
                            bottom: 100,
                            left: 100
                        },
                        x: function(d){return d.date;},
                        y: function(d){return d.value;},
                        color: d3.scale.category10().range(),
                        useInteractiveGuideline: true,
                        useVoronoi: false,
                        interpolate: false,
                        transitionDuration: 0,
                        xAxis: {
                            showMaxMin: false,
                            tickFormat: formatters.date
                        },
                        yAxis: {
                            tickFormat: formatters.currency
                        }
                    }
                };

                $scope.data = [
                    {
                        "key" : "Assets" ,
                        "values" : data.assets
                    },

                    {
                        "key" : "Liabilities" ,
                        "values" : data.liabilities
                    },
                    {
                        "key": "Inflation",
                        "values": data.inflation
                    },
                    {
                        "key": "Net",
                        "values": data.net
                    }
                ];
            });
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('gnucashNetWorth', ['$timeout', 'formatters', NetworthDirectiveGenerator]);