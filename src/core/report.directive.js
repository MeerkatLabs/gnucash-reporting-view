(function() {

    angular.module('gnucash-reports-view')
        .directive('gnucashReport', ReportDirectiveGenerator);

    ReportDirectiveGenerator.$inject = ['$mdDialog', 'ReportsManagement'];

    /**
     * Directive that is responsible displaying the report data for each report.
     */
    function ReportDirectiveGenerator($mdDialog, ReportsManagement) {
        return {
            restrict: 'E',
            scope: {
                report: '&'
            },
            templateUrl: 'core/reportDirective.html',
            link: link
        };

        //////////////////////////////////////////////////////

        function link($scope) {

            var report = $scope.report();

            // Find the template associated with the report type and load it into the directive.
            var template = ReportsManagement.getTemplate(report.type);

            if (angular.isDefined(template)) {
                $scope.template = template;
            } else {
                console.error("Couldn't find template:", report.type);
            }

            // Backwards compatibility for the legacy report generation.  This was due to refactoring of the gnucash
            // report directive.
            $scope.reportData = function() {
                return report.data;
            };

            // Set up the dialog service for displaying the information button handlers.
            $scope.displayDescription = function() {
                $mdDialog.show({
                    templateUrl: 'src/core/descriptionDialog.html',
                    clickOutsideToClose: true,
                    controller: function($scope, $mdDialog) {
                        $scope.name = report.name;
                        $scope.description = report.description;

                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                    }
                });
            };
        }
    }

})();