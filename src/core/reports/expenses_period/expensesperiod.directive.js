(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashExpensesPeriod', ExpensesPeriodDirectiveGenerator);

    ExpensesPeriodDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

    function ExpensesPeriodDirectiveGenerator($timeout, colorDefinitions, formatters) {
        return {
            scope: {
                reportData: '&'
            },
            templateUrl: 'core/reports/expenses_period/expensesPeriodDirective.html',
            link: link
        };

        function link($scope) {
            var data = $scope.reportData();

            $timeout(function() {
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
                        showValues: true,
                        valueFormat: formatters.currency,
                        showControls: false,
                        transitionDuration: 0,
                        xAxis: {
                            axisLabel: '',
                            tickFormat: formatters.date,
                            rotateLabels: 30,
                            showMaxMin: true
                        },
                        yAxis: {
                            axisLabel: 'Total Expenses',
                            axisLabelDistance: 35,
                            tickFormat: formatters.currencyNoParts,
                            showMaxMin: true
                        }
                    }
                };

                $scope.data = [
                    {
                        key : 'Expenses',
                        bar: false,
                        values : data.expenses,
                        color: colorDefinitions.base
                    }
                ];

            });

        }
    }

})();