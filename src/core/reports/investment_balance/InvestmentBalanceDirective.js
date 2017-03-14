/**
 * Created by rerobins on 9/29/15.
 */
var InvestmentBalanceDirectiveGenerator = function(colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/investment_balance/investmentBalanceDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'multiChart',
                    height: 450,
                    margin : {
                        top: 30,
                        right: 60,
                        bottom: 100,
                        left: 100
                    },
                    color: [colorDefinitions.best, colorDefinitions.good, '#000000'],
                    useInteractiveGuideline: true,
                    useVoronoi: false,
                    interpolate: false,
                    transitionDuration: 0,
                    toolTips: true,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: formatters.date
                    },
                    yAxis1: {
                        tickFormat: formatters.currency
                    }
                }
            };

            $scope.data = [
                {
                    "type": "area",
                    "yAxis": 1,
                    "key" : "Dividend" ,
                    "values" : function() {
                        var results = [];
                        data.dividend.forEach(function(element) {
                            results.push({x: element[0], y: element[1]});
                        });
                        return results;
                    }()
                },

                {
                    "type": "area",
                    "yAxis": 1,
                    "key" : "Purchases" ,
                    "values" : function() {
                        var results = [];
                        data.purchases.forEach(function(element) {
                            results.push({x: element[0], y: element[1]});
                        });
                        return results;
                    }()
                },
                {
                    "type": "line",
                    "yAxis": 1,
                    "key": "Value",
                    "values": function() {
                        var results = [];
                        data.value.forEach(function(element) {
                            results.push({x: element[0], y: element[1]});
                        });
                        return results;
                    }()
                }

            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('investmentBalance', ['colorDefinitions', 'formatters', InvestmentBalanceDirectiveGenerator]);