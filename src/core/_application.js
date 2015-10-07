// Define the application.
angular.module('gnucash-reports-view', ['ngMaterial', 'ui.router', 'gnucash-reports-view.reports', 'ngMdIcons'])
    .config(['$urlRouterProvider', function($urlRouterProvider) {
        $urlRouterProvider.otherwise('/main');
    }]);