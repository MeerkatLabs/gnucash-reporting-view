
angular.module('gnucash-reports-view.reports.category', ['gnucash-reports-view.reports.base',
                                                          'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        var categoryTemplate = 'core/reports/category/category.html';
        provider.addTemplate('account_usage_categories', categoryTemplate);
        provider.addTemplate('expenses_categories', categoryTemplate);
        provider.addTemplate('investment_allocation', categoryTemplate);
        provider.addTemplate('expense_accounts', categoryTemplate);
    }]);
