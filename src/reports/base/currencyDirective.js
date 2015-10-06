/**
 * Created by rerobins on 10/6/15.
 */
var CurrencyDirectiveGenerator = function(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: function($scope) {
            if ($scope.value() > 0.0) {
                $scope.style = {color: 'green'};
                $scope.currencyValue = formatters.currency($scope.value());
            } else if ($scope.value() < 0.0) {
                $scope.style = {color: 'red'};
                $scope.currencyValue = formatters.currency($scope.value());
            }
        }
    };

};

angular.module('gnucash-reports-view.reports.base')
    .directive('currencyFormat', ['formatters', CurrencyDirectiveGenerator]);

