/**
 * Created by rerobins on 10/6/15.
 */
var PercentageDirectiveGenerator = function(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: function($scope) {

            if (angular.isNumber($scope.value())) {

                $scope.currencyValue = formatters.percentage($scope.value());

                if ($scope.value() > 0.0) {
                    $scope.style = {color: 'green'};
                } else if ($scope.value() < 0.0) {
                    $scope.style = {color: 'red'};
                }
            } else {
                $scope.currencyValue = 'N/A';
            }

        }
    };

};

angular.module('gnucash-reports-view.reports')
    .directive('percentageFormat', ['formatters', PercentageDirectiveGenerator]);

