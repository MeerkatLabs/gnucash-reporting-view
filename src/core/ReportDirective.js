/**
 * Created by rerobins on 9/28/15.
 */
var ReportDirectiveGenerator = function(ReportsManagement) {
    return {
        scope: {
            reportData: '&',
            reportType: '&'
        },
        templateUrl: 'src/core/reportDirective.html',
        link: function($scope) {
            var template = ReportsManagement.getTemplate($scope.reportType());

            if (angular.isDefined(template)) {
                $scope.template = template;
                console.log("Found template: ", $scope.reportType());
            } else {
                console.log("Couldn't find template:", $scope.reportType());
            }

        }
    };
};

angular.module('gnucash-reports-view')
    .directive('gnucashReport', ['ReportsManagement', ReportDirectiveGenerator]);