var DisplayController = function($mdUtil, $mdSidenav, $timeout, content) {

    var controller = this;

    $timeout(function() {
        controller.page_definition = content;
    });

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
};

angular.module('gnucash-reports-view')
    .controller('DisplayController', ['$mdUtil', '$mdSidenav', '$timeout', 'content', DisplayController])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('report', {
            url: '/report/:report',
            controller: 'DisplayController',
            templateUrl: 'src/core/DisplayController.html',
            controllerAs: 'displayController',
            resolve: {
                content: function(ReportsService, $stateParams) {
                    return ReportsService.loadPage($stateParams.report);
                }
            }
        });
    }]);
