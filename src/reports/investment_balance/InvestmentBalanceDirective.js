/**
 * Created by rerobins on 9/29/15.
 */
var InvestmentBalanceDirectiveGenerator = function() {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/investment_balance/investmentBalanceDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'stackedAreaChart',
                    height: 300,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 60,
                        left: 70
                    },
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    useVoronoi: false,
                    clipEdge: true,
                    transitionDuration: 500,
                    useInteractiveGuideline: true,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: function(d) {
                            return d3.time.format('%x')(new Date(d));
                        }
                    },
                    yAxis: {
                        tickFormat: function(d){
                            return d3.format(',.2f')(d);
                        }
                    }
                }
            };

            $scope.data = [
                {
                    "key" : "Dividend" ,
                    "values" : data.dividend
                },

                {
                    "key" : "Purchases" ,
                    "values" : data.purchases
                }

            ];
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('investmentBalance', [InvestmentBalanceDirectiveGenerator]);