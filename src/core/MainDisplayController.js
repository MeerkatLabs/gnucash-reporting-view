
var MainDisplayController = function($mdUtil, $mdSidenav, ReportsService) {
    var controller = this;

    controller.toggleLeft = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle();
        }, 200);
        return debounceFn;
    }

    ReportsService.reportsContent.then(function(results) {
        controller.lastUpdated = results.last_updated;
    });
};

angular.module('gnucash-reports-view')
    .controller('MainDisplay', ['$mdUtil', '$mdSidenav', 'ReportsService', MainDisplayController])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider.state('main', {
            url: '/main',
            controller: 'MainDisplay',
            controllerAs: 'controller',
            templateUrl: 'src/core/MainDisplay.html'
        });
    }]);
