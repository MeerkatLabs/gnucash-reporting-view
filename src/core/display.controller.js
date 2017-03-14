(function() {

    angular.module('gnucash-reports-view')
        .controller('DisplayController', DisplayController);

    DisplayController.$inject = ['$mdUtil', '$mdSidenav', '$timeout', 'content'];

    function DisplayController($mdUtil, $mdSidenav, $timeout, content) {

        var controller = this;

        $timeout(function() {
            controller.page_definition = content.data;
        });

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
    }

})();