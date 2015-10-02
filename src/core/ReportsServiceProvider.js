// Service provider responsible for loading the reports and creating the pages.
var ReportsService = function($http, $q, reportFile) {

    var service = this;

    var my_data = null;

    service.reportsContent = $http.get(reportFile).then(function(res) {
        my_data = res.data;
        return res.data;
    });

    service.loadPage = function(page) {
        var found = false;
        angular.forEach(my_data.reports, function(report) {
            if (report.file === page) {
                found = true;
            }
        });

        if (found) {
            return $http.get('data/' + page).then(function(res) {
                console.log('res.data', res.data);
                return res.data;
            });
        } else {
            return $q.reject('Couldn"t find page definition');
        }
    };

    return service;

};

/**
 * Provider that will create the Reports Service.
 * @constructor
 */
var ReportsServiceProvider = function() {

    var provider = this;

    this.configureReportFile = function(path) {
        provider.reportFile = path;
    };

    this.$get = ['$http', '$q', function($http, $q) {
        return ReportsService($http, $q, provider.reportFile);
    }];

};

angular.module('gnucash-reports-view')
    .provider('ReportsService', ReportsServiceProvider);