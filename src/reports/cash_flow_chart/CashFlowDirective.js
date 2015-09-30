/**
 * Created by rerobins on 9/29/15.
 */
var CashFlowDirectiveGenerator = function() {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/cash_flow_chart/cashFlowDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 70,
                        left: 75
                    },
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    showValues: true,
                    valueFormat: function(d){
                        return d3.format(',.2f')(d);
                    },
                    stacked: true,
                    transitionDuration: 500,
                    xAxis: {
                        axisLabel: 'X Axis',
                        tickFormat: function(d) {
                            return d3.time.format('%x')(new Date(d));
                        },
                        rotateLabels: 50,
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'Y Axis',
                        axisLabelDistance: 35,
                        tickFormat: function(d){
                            return d3.format(',.2f')(d);
                        }
                    }
                }
            };

            var creditValues = [];
            var debitValues = [];
            var grossValues = [];
            data.credits.forEach(function(dataValue) {
                creditValues.push([dataValue.date * 1000, dataValue.value]);
            });

            data.debits.forEach(function(dataValue) {
                debitValues.push([dataValue.date * 1000, dataValue.value]);
            });

            data.gross.forEach(function(dataValue) {
                grossValues.push([dataValue.date * 1000, dataValue.value]);
            });

            $scope.data = [
                {
                    "key" : "Credits" ,
                    "bar": true,
                    "color": "#007700",
                    "values" : creditValues
                },
                {
                    "key" : "Debits" ,
                    "bar": true,
                    "color": "#770000",
                    "values" : debitValues
                }
            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.cash_flow')
    .directive('cashFlow', [CashFlowDirectiveGenerator]);