(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashCurrencyFormat', CurrencyDirectiveGenerator);

    CurrencyDirectiveGenerator.$inject = ['formatters'];

    function CurrencyDirectiveGenerator(formatters) {

        return {
            scope: {
                value: '&'
            },
            template: '<span ng-style="style">{{currencyValue}}</span>',
            link: link
        };

        ////////////////////////////////////////////////////////////////////////

        function link($scope) {
            $scope.currencyValue = formatters.currency($scope.value());

            if ($scope.value() > 0.0) {
                $scope.style = {color: 'green'};
            } else if ($scope.value() < 0.0) {
                $scope.style = {color: 'red'};
            }
        }

    }

})();