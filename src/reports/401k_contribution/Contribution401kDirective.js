/**
 * Created by rerobins on 9/29/15.
 */
var Contribution401kDirectiveGenerator = function() {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'src/reports/401k_contribution/401k_reportDirective.html',
        link: function($scope) {
            var data = $scope.reportData();

            $scope.options = {
                chart: {
                    type: 'bulletChart',
                    transitionDuration: 500
                }
            };

            var graphMargin = 1.1;

            var maximum_value = Math.max(data.contribution*graphMargin, data.contributionLimit*graphMargin);

            var currentContributionPoint = (data.dayOfYear / data.daysInYear) * data.contributionLimit;

            $scope.data =  {
                "title": "Account",
                "subtitle": "US$",
                "ranges": [0, maximum_value],
                "measures": [data.contribution],
                "markers": [currentContributionPoint, data.contributionLimit]
            };
        }
    };
};

angular.module('gnucash-reports-view.reports.account_levels')
    .directive('contribution401k', [Contribution401kDirectiveGenerator]);