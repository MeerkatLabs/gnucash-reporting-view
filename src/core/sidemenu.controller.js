(function() {

    angular.module('gnucash-reports-view')
        .controller('SideMenuController', SideMenuController);

    SideMenuController.$inject = ['$mdSidenav', 'ReportsService'];

    // Side menu controller.
    function SideMenuController($mdSidenav, ReportsService) {

        var controller = this;

        controller.reports = [];
        controller.displayReport = displayReport;

        ReportsService.reportsContent.then(function(results) {
            controller.reports = results.data.reports;
        });

        /**
         * Fire off a signal that will toggle the closing of the side bar when the button is pressed.
         */
        function displayReport() {
            $mdSidenav('left').close();
        }

    }

})();