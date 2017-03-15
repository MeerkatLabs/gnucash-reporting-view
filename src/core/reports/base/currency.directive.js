(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashCurrencyFormat', CurrencyDirectiveGenerator);

    CurrencyDirectiveGenerator.$inject = [];

    function CurrencyDirectiveGenerator() {

        return {
            scope: {
                value: '&'
            },
            template: '<span ng-class="style">{{::currencyValue|currency}}</span>',
            link: link
        };

        ////////////////////////////////////////////////////////////////////////

        function link($scope) {
            $scope.currencyValue = $scope.value();

            if ($scope.value() > 0.0) {
                $scope.style = 'currencyPositive';
            } else if ($scope.value() < 0.0) {
                $scope.style = 'currencyNegative';
            }
        }

    }

})();