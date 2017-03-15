(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashPercentageFormat', PercentageDirectiveGenerator);

    PercentageDirectiveGenerator.$inject = [];

    function PercentageDirectiveGenerator() {

        return {
            scope: {
                value: '&'
            },
            template: '<span ng-class="style">{{::percentageValue | percentage}}</span>',
            link: link
        };

        //////////////////////////////////////////////////////////////////////////
        function link($scope) {

            $scope.percentageValue = $scope.value();

            if ($scope.value() > 0.0) {
                $scope.style = 'percentagePositive';
            } else if ($scope.value() < 0.0) {
                $scope.style = 'percentageNegative';
            }
        }

    }

})();