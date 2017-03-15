(function() {

    angular.module('gnucash-reports-view.reports')
        .directive('gnucashNetWorthBreakdown', NetworthBreakdownDirectiveGenerator);

    NetworthBreakdownDirectiveGenerator.$inject = ['formatters'];

    function NetworthBreakdownDirectiveGenerator(formatters) {
        return {
            restrict: 'E',
            scope: {
                data: '&',
                deltas: '&',
                trends: '&',
                header: '&'
            },
            templateUrl: 'core/reports/net_worth_table/net_worth_breakdown.html'
        };
    }

})();