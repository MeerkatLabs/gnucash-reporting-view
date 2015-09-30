/**
 * Created by rerobins on 9/29/15.
 */
var ExpensesMonthlyDirectiveGenerator = function() {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/expenses_monthly/expensesMonthlyDirective.html',
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
                        left: 50
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

            var dataValues = [];
            data.expenses.forEach(function(dataValue) {
                dataValues.push([dataValue.date * 1000, dataValue.value]);
            });

            $scope.data = [
                {
                    "key" : "Expenses" ,
                    "bar": true,
                    "values" : dataValues
                }
            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.expenses_monthly')
    .directive('expensesMonthly', [ExpensesMonthlyDirectiveGenerator]);