(function() {

    angular.module('gnucash-reports-view.reports')
        .config(registerPercentageFilter);

    registerPercentageFilter.$inject = ['$filterProvider'];

    function registerPercentageFilter($filterProvider) {

        percentageFilter.$inject = ['$filter'];
        function percentageFilter($filter) {
            return function(text) {

                var result = text;
                if (angular.isNumber(text)) {

                    var numberFilter = $filter('number'),
                        percentageValue = text * 100.0;

                    result = numberFilter(percentageValue, 2) + '%';

                }

                return result;
            };
        }

        $filterProvider.register('percentage', percentageFilter);

    }

})();