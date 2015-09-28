// Service provider responsible for loading the reports and creating the pages.
var ReportsService = function($http, reportFile) {

    var service = this;

    service.reportsContent = $http.get(reportFile).then(function(res) {
        return res.data;
    });

    service.loadPage = function(page) {
        return $http.get('data/' + page).then(function(res) {
            console.log('res.data', res.data);
            return res.data;
        });
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

    this.$get = ['$http', function($http) {
        return ReportsService($http, provider.reportFile);
    }];

};

angular.module('gnucash-reports-view')
    .provider('ReportsService', ReportsServiceProvider);