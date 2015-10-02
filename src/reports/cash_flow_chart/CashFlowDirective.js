/**
 * Created by rerobins on 9/29/15.
 */
var CashFlowDirectiveGenerator = function(formatters) {
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
                        bottom: 100,
                        left: 100
                    },
                    x: function(d){return d.date;},
                    y: function(d){return d.value;},
                    showControls: false,
                    showValues: true,
                    valueFormat: formatters.currency,
                    stacked: true,
                    transitionDuration: 500,
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
                    "key" : "Credits" ,
                    "bar": true,
                    "color": "#007700",
                    "values" : data.credits
                },
                {
                    "key" : "Debits" ,
                    "bar": true,
                    "color": "#770000",
                    "values" : data.debits
                }
            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.cash_flow')
    .directive('cashFlow', ['formatters', CashFlowDirectiveGenerator]);