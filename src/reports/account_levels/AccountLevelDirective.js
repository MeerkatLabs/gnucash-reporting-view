/**
 * Created by rerobins on 9/29/15.
 */
var AccountLevelDirectiveGenerator = function(formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/account_levels/accountLevelDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'bulletChart',
                    transitionDuration: 0,
                    tooltip: {
                        valueFormatter: formatters.currency
                    },
                    tickFormat: formatters.currencyNoParts
                }
            };

            var graphMargin = 1.1;

            var maximum_value = Math.max(data.good_value*graphMargin, data.balance*graphMargin);

            $scope.data =  {
                "title": "Account",
                "subtitle": "US$",
                "ranges": [data.error_value, data.warn_value, maximum_value],
                "measures": [data.balance],
                "markers": [data.good_value]
            };
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('accountLevel', ['formatters', AccountLevelDirectiveGenerator]);