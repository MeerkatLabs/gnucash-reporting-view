(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashPercentageFormat', PercentageDirectiveGenerator);

    PercentageDirectiveGenerator.$inject = ['formatters'];

    function PercentageDirectiveGenerator(formatters) {

        return {
            scope: {
                value: '&'
            },
            template: '<span ng-style="style">{{currencyValue}}</span>',
            link: link
        };

        //////////////////////////////////////////////////////////////////////////
        function link($scope) {
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

    }

})();