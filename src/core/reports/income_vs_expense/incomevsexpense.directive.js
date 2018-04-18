(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashIncomeVsExpense', IncomeVsExpenseDirectiveGenerator);

    IncomeVsExpenseDirectiveGenerator.$inject = ['colorDefinitions', 'formatters'];

    function IncomeVsExpenseDirectiveGenerator(colorDefinitions, formatters) {
        return {
            restrict: 'E',
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/income_vs_expense/income_vs_expenseDirective.html',
            link: link
        };

        function link($scope) {
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
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    showControls: false,
                    showValues: true,
                    valueFormat: formatters.currency,
                    stacked: true,
                    transitionDuration: 0,
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

            data.expenses.forEach(function(dataValue) {
                if (dataValue[1] === 0) {
                    // TODO: Figure out how to do this so that it doesn't display as -0.0001 in the graph.
                    dataValue[1] = -0.00001;
                }
            });


            $scope.data = [
                {
                    key : 'Income',
                    bar: true,
                    color: colorDefinitions.credit,
                    values : data.income
                },
                {
                    key : "Expenses" ,
                    bar: true,
                    color: colorDefinitions.debit,
                    values : data.expenses
                }
            ];

            $scope.tableData = data;
        }
    }

})();