/**
 * Created by rerobins on 9/29/15.
 */
var InvestmentTrendDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createInvestmentTrendChart = function($scope) {
        var data = $scope.reportData();

        var basisMax = 0.0;
        var increaseMax = 0.0;

        $scope.data = [
            {
                type: 'bar',
                yAxis: 1,
                key: 'Basis',
                values: function() {
                    var results = [];
                    data.basis.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        basisMax = Math.max(basisMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Purchase',
                values: function() {
                    var results = [];
                    data.money_in.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Dividends',
                values : function() {
                    var results = [];
                    data.income.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Expenses',
                values : function() {
                    var results = [];
                    data.expense.forEach(function(element) {
                        results.push({x: element[0], y: -element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'line',
                yAxis: 1,
                key : 'Value',
                values : function() {
                    var results = [];
                    data.value.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        basisMax = Math.max(basisMax, element[1]);
                    });
                    return results;
                }()
            }

        ];

        $scope.options = {
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 100,
                    bottom: 100,
                    left: 100
                },
                color: [
                    colorDefinitions.good, colorDefinitions.best,
                    colorDefinitions.info, colorDefinitions.error, '#000000'],
                useInteractiveGuideline: true,
                useVoronoi: false,
                interpolate: false,
                transitionDuration: 0,
                toolTips: true,
                yDomain1: [0, basisMax],
                yDomain2: [0, increaseMax],
                xAxis: {
                    showMaxMin: false,
                    tickFormat: formatters.date
                },
                yAxis1: {
                    tickFormat: formatters.currency
                },
                yAxis2: {
                    tickFormat: formatters.currency
                }
            }
        };
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/investment_trend/investment_trendDirective.html',
        link: function($scope) {
            $timeout(createInvestmentTrendChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports.investment_trend')
    .directive('investmentTrend', ['$timeout', 'colorDefinitions', 'formatters', InvestmentTrendDirectiveGenerator]);