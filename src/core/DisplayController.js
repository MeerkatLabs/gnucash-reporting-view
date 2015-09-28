var DisplayController = function(content) {

    var controller = this;

    controller.page_definition = content;
};

angular.module('gnucash-reports-view')
    .controller('DisplayController', ['content', DisplayController])
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
