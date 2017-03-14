/**
 * Created by rerobins on 9/30/15.
 */
angular.module('gnucash-reports-view.reports.box_plot', ['gnucash-reports-view.reports.base',
    'nvd3'])
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('expenses_box', 'core/reports/box_plot/box_plot.html');
    }]);