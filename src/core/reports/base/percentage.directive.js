(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashPercentageFormat', PercentageDirectiveGenerator);

    PercentageDirectiveGenerator.$inject = ['formatters'];

    function PercentageDirectiveGenerator(formatters) {

        return {
            scope: {
                value: '&'
            },
            template: '<span ng-class="style">{{::percentageValue}}</span>',
            link: link
        };

        //////////////////////////////////////////////////////////////////////////
        function link($scope) {
            if (angular.isNumber($scope.value())) {

                $scope.percentageValue = formatters.percentage($scope.value());

                if ($scope.value() > 0.0) {
                    $scope.style = 'percentage-positive';
                } else if ($scope.value() < 0.0) {
                    $scope.style = 'percentage-negative';
                }
            } else {
                $scope.percentageValue = 'N/A';
            }
        }

    }

})();