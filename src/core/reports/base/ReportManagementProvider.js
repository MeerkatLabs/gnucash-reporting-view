/**
 * Report Management Service
 */
// Service provider responsible for loading the reports and creating the pages.
var ReportsManagement = function(_templates) {

    var service = this;
    var templates = _templates;

    service.getTemplate = function(templateId) {
        return templates[templateId];
    };

    return service;

};

/**
 * Provider that will create the Reports Service.
 * @constructor
 */
var ReportsManagementProvider = function() {

    var provider = this;

    provider.providerTemplates = {};

    provider.addTemplate = function(type, template) {
        provider.providerTemplates[type] = template;
        return provider;
    };

    this.$get = [function() {
        return ReportsManagement(provider.providerTemplates);
    }];

};

angular.module('gnucash-reports-view.reports')
    .provider('ReportsManagement', ReportsManagementProvider);