(function() {

    angular.module('gnucash-reports-view')
        .controller('SideMenuController', SideMenuController);

    SideMenuController.$inject = ['ReportsService'];

    // Side menu controller.
    function SideMenuController(ReportsService) {

        var controller = this;

        controller.reports = [];

        ReportsService.reportsContent.then(function(results) {
            controller.reports = results.data.reports;
        });

    }

})();