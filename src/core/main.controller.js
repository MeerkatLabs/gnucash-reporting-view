(function() {

    angular.module('gnucash-reports-view')
        .controller('MainDisplay', MainDisplayController);

    MainDisplayController.$inject = ['$mdUtil', '$mdSidenav', 'ReportsService'];

    function MainDisplayController($mdUtil, $mdSidenav, ReportsService) {
        var controller = this;

        controller.toggleLeft = buildToggler('left');

        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildToggler(navID) {
            var debounceFn =  $mdUtil.debounce(function(){
                $mdSidenav(navID).toggle();
            }, 200);
            return debounceFn;
        }

        ReportsService.reportsContent.then(function(results) {
            controller.lastUpdated = results.data.last_updated;
            controller.modificationDate = results.data.modification_time;
        });
    }

})();