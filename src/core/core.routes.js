(function() {

    angular.module('gnucash-reports-view')
        .config(injectCoreStates);

    injectCoreStates.$inject = ['$urlRouterProvider', '$stateProvider'];

    function injectCoreStates($urlRouterProvider, $stateProvider) {

        $urlRouterProvider.otherwise('/main');

        $stateProvider.state('report', {
            url: '/report/:report',
            controller: 'DisplayController',
            templateUrl: 'src/core/display.html',
            controllerAs: 'displayController',
            resolve: {
                content: contentResolver
            }
        });

        $stateProvider.state('main', {
            url: '/main',
            controller: 'MainDisplay',
            controllerAs: 'controller',
            templateUrl: 'src/core/main.html'
        });

        /////////////////////////////////////////////////////////

        contentResolver.$inject = ['ReportsService', '$stateParams'];

        function contentResolver(ReportsService, $stateParams) {
            return ReportsService.loadPage($stateParams.report);
        }

    }

})();