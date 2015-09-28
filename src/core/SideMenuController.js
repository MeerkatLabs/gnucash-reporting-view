// Side menu controller.
var SideMenuController = function(ReportsService) {

    var controller = this;

    controller.reports = [];

    ReportsService.reportsContent.then(function(results) {
        controller.reports = results;
    });

};

angular.module('gnucash-reports-view')
    .controller('SideMenuController', ['ReportsService', SideMenuController]);