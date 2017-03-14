

angular.module('gnucash-reports-view')
    .provider('ReportsService', ReportsServiceProvider);


/**
 * Provider that will create the Reports Service.
 * @constructor
 */
function ReportsServiceProvider() {

    var provider = this;

    this.configureReportFile = function(path) {
        provider.reportFile = path;
    };

    this.$get = ReportsService;

    /////////////////////////////////////////////////////////////

    ReportsService.$inject = ['$http'];

    // Service provider responsible for loading the reports and creating the pages.
    function ReportsService($http) {

        var reportsContent = $http.get(provider.reportFile);

        return {
            reportsContent: reportsContent,
            loadPage: loadPage
        };

        function loadPage(page) {

            return reportsContent.then(function(results) {
                var found = false,
                    data = results.data;

                angular.forEach(data.reports, function(report) {
                    if (report.file === page) {
                        found = true;
                    }
                });

                if (found) {
                    return $http.get('data/' + page);
                } else {
                    throw 'Couldn"t find page definition';
                }
            });
        }

    }

}
