// Define the application.
angular.module('gnucash-reports-view', ['ngMaterial', 'ui.router', 'gnucash-reports-view.reports'])
    .controller('MainDisplay', function() {

    }).config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/main');

        $stateProvider.state('main', {
            url: '/main',
            controller: 'MainDisplay',
            templateUrl: 'src/core/MainDisplay.html'
        });
    }]);