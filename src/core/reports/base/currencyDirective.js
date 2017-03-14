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
            $scope.currencyValue = formatters.currency($scope.value());

            if ($scope.value() > 0.0) {
                $scope.style = {color: 'green'};
            } else if ($scope.value() < 0.0) {
                $scope.style = {color: 'red'};
            }
        }
    };

};

angular.module('gnucash-reports-view.reports')
    .directive('currencyFormat', ['formatters', CurrencyDirectiveGenerator]);

