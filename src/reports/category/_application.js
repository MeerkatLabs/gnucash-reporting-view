
angular.module('gnucash-reports-view.reports.category', ['gnucash-reports-view.reports.base',
                                                          'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('account_usage_categories', 'src/reports/category/category.html');
        provider.addTemplate('expenses_categories', 'src/reports/category/category.html');
    }]);
