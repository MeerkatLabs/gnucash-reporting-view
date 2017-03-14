/**
 * Report Management Service
 */

angular.module('gnucash-reports-view.reports')
    .provider('ReportsManagement', ReportsManagementProvider);

/**
 * Provider that will create the Reports Service.
 * @constructor
 */
function ReportsManagementProvider() {

    var provider = this;

    provider.providerTemplates = {};

    provider.addTemplate = function(type, template) {
        provider.providerTemplates[type] = template;
        return provider;
    };

    this.$get = function() {
        return ReportsManagement(provider.providerTemplates);
    };

}


// Service provider responsible for loading the reports and creating the pages.
function ReportsManagement(_templates) {

    var service = this;
    var templates = _templates;

    service.getTemplate = function(templateId) {
        return templates[templateId];
    };

    return service;

}
