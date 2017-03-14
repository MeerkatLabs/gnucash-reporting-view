// Define the application.
angular.module('gnucash-reports-view', ['ngMaterial', 'ui.router', 'gnucash-reports-view.reports', 'ngMdIcons']);

angular.module('gnucash-reports-view.reports', [
    'nvd3',
    'md.data.table',
    'ngMaterial']);


angular.module('gnucash-reports-view')
    .config(injectCoreStates);

injectCoreStates.$inject = ['$urlRouterProvider', '$stateProvider'];

function injectCoreStates($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.otherwise('/main');

    $stateProvider.state('report', {
        url: '/report/:report',
        controller: 'DisplayController',
        templateUrl: 'src/core/display.html',
        controllerAs: 'displayController',
        resolve: {
            content: contentResolver
        }
    });

    $stateProvider.state('main', {
        url: '/main',
        controller: 'MainDisplay',
        controllerAs: 'controller',
        templateUrl: 'src/core/main.html'
    });

    /////////////////////////////////////////////////////////

    contentResolver.$inject = ['ReportsService', '$stateParams'];

    function contentResolver(ReportsService, $stateParams) {
        return ReportsService.loadPage($stateParams.report);
    }

}

angular.module('gnucash-reports-view')
    .controller('DisplayController', DisplayController);

DisplayController.$inject = ['$mdUtil', '$mdSidenav', '$timeout', 'content'];

function DisplayController($mdUtil, $mdSidenav, $timeout, content) {

    var controller = this;

    $timeout(function() {
        controller.page_definition = content.data;
    });

    controller.toggleLeft = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID).toggle();
        }, 200);
        return debounceFn;
    }
}


angular.module('gnucash-reports-view')
    .controller('MainDisplay', MainDisplayController);

MainDisplayController.$inject = ['$mdUtil', '$mdSidenav', 'ReportsService'];

function MainDisplayController($mdUtil, $mdSidenav, ReportsService) {
    var controller = this;

    controller.toggleLeft = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID).toggle();
        }, 200);
        return debounceFn;
    }

    ReportsService.reportsContent.then(function(results) {
        controller.lastUpdated = results.data.last_updated;
        controller.modificationDate = results.data.modification_time;
    });
}


angular.module('gnucash-reports-view')
    .directive('gnucashReport', ReportDirectiveGenerator);


ReportDirectiveGenerator.$inject = ['$mdDialog', 'ReportsManagement'];

/**
 * Directive that is responsible displaying the report data for each report.
 */
function ReportDirectiveGenerator($mdDialog, ReportsManagement) {
    return {
        scope: {
            report: '&'
        },
        templateUrl: 'src/core/reportDirective.html',
        link: link
    };

    //////////////////////////////////////////////////////

    function link($scope) {

        var report = $scope.report();

        // Find the template associated with the report type and load it into the directive.
        var template = ReportsManagement.getTemplate(report.type);

        if (angular.isDefined(template)) {
            $scope.template = template;
        } else {
            console.error("Couldn't find template:", report.type);
        }

        // Backwards compatibility for the legacy report generation.  This was due to refactoring of the gnucash
        // report directive.
        $scope.reportData = function() {
            return report.data;
        };

        // Set up the dialog service for displaying the information button handlers.
        $scope.displayDescription = function() {
            $mdDialog.show({
                templateUrl: 'src/core/descriptionDialog.html',
                clickOutsideToClose: true,
                controller: function($scope, $mdDialog) {
                    $scope.name = report.name;
                    $scope.description = report.description;

                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                }
            });
        };
    }
}

/**
 * Graph generator that will show progress of gathering money for 401k values.  This is similar to the budget graph
 * except excess over the days current value is shown as green, as opposed to a warning.  Excess over the years value
 * is still shown as an error value.
 */
angular.module('gnucash-reports-view.reports')
    .directive('gnucashContribution401k', Contribution401kDirectiveGenerator);


Contribution401kDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function Contribution401kDirectiveGenerator($timeout, colorDefinitions, formatters) {



    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/401k_contribution/401k_reportDirective.html',
        link: function($scope) {
            $timeout(create401kContributionGraph, 0, true, $scope);
        }
    };

    function create401kContributionGraph($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }
        };

        var label = formatters.currency(data.contributionLimit);

        var todayValue = (data.dayOfYear / data.daysInYear) * data.contributionLimit;

        if (data.contribution > data.contributionLimit) {
            $scope.data = [
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.contributionLimit
                        }
                    ]
                },
                {
                    key: 'Contribution Overage',
                    color: colorDefinitions.error,
                    values: [
                        {
                            label: label,
                            value: data.contribution - data.contributionLimit
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        } else if (data.contribution > todayValue) {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: todayValue
                        }
                    ]
                },
                {
                    key: 'Today Overage',
                    color: colorDefinitions.best,
                    values: [
                        {
                            label: label,
                            value: data.contribution - todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: data.contributionLimit - data.contribution
                        }
                    ]
                }
            ];

            $scope.options.chart.stacked = true;
        } else {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: data.contribution
                        }
                    ]
                },
                {
                    key: 'Today',
                    color: colorDefinitions.warning,
                    values: [
                        {
                            label: label,
                            value: todayValue - data.contribution
                        }
                    ]
                },
                {
                    key: 'Today Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: data.contributionLimit - todayValue
                        }
                    ]
                }
            ];

            $scope.options.chart.stacked = true;
        }
    }

}


/**
 * Directive that will display the account level information on the display.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashAccountLevel', AccountLevelDirectiveGenerator);

AccountLevelDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function AccountLevelDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/account_levels/accountLevelDirective.html',
        link: function($scope) {
            $timeout(createAccountLevelGraph, 0, true, $scope);
        }
    };

    /**
     * Translate the values of the data report into something that can be rendered.
     * @param $scope
     */
    function createAccountLevelGraph($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }


        };

        var label = formatters.currency(data.good_value);

        if (data.balance < data.good_value) {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.info,
                    values : [
                        {
                            label: label,
                            value: data.balance
                        }
                    ]
                },
                {
                    key: 'Underage',
                    color: colorDefinitions.base,
                    values : [
                        {
                            label: label,
                            value: data.good_value - data.balance
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = true;

            if (data.balance < data.error_value) {
                $scope.data[0].color = colorDefinitions.error;
            } else if (data.balance < data.warn_value) {
                $scope.data[0].color = colorDefinitions.warning;
            }

        } else {
            // Build overage Chart
            $scope.data = [
                {
                    "key": 'Goal',
                    "color": colorDefinitions.good,
                    "values" : [
                        {
                            label: label,
                            value: data.good_value
                        }
                    ]
                },
                {
                    key: 'Overage',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: data.balance - data.good_value
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        }
    }

}


/**
 * Color Definition constants for all of the code.
 */
angular.module('gnucash-reports-view.reports')
    .constant('colorDefinitions', {
        // Core Value
        base: 'LightSteelBlue',

        // Color Scale values.
        best: 'ForestGreen',
        good: 'DarkSeaGreen',
        info: 'Khaki',
        warning: 'SandyBrown',
        error: 'LightCoral',

        // Total Sale Values
        totalGood: 'LightCyan',
        totalBad: 'LightCoral',

        // Credit Debit Values
        credit: 'DarkSeaGreen',
        debit: 'LightCoral'
    });
/**
 * Created by rerobins on 10/6/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashCurrencyFormat', CurrencyDirectiveGenerator);

CurrencyDirectiveGenerator.$inject = ['formatters'];

function CurrencyDirectiveGenerator(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: link
    };

    ////////////////////////////////////////////////////////////////////////

    function link($scope) {
        $scope.currencyValue = formatters.currency($scope.value());

        if ($scope.value() > 0.0) {
            $scope.style = {color: 'green'};
        } else if ($scope.value() < 0.0) {
            $scope.style = {color: 'red'};
        }
    }

}




/**
 * Define the formatters that are going to be used by the constant.  This will prevent them from being constructed each
 * time they are executed.
 * @type {{currency: *, currencyNoParts: *}}
 * @private
 */
var _formatters = {
    // Currency with parts.
    currency: d3.format('$,.02f'),

    // Currency with no parts.
    currencyNoParts: d3.format('$,'),

    // Date formatter %x
    date: d3.time.format('%x'),

    // Percentage formatter
    percentage: d3.format('.02%')

};

angular.module('gnucash-reports-view.reports')
    .constant('formatters', {

        /**
         * Full currency including parts.
         * @param d decimal
         * @returns {*}
         */
        currency: function(d) {
            return _formatters.currency(d);
        },

        /**
         * Currency String without the parts of a currency.
         * @param d decimal
         * @returns {*}
         */
        currencyNoParts: function(d) {
            return _formatters.currencyNoParts(d);
        },

        /**
         * Converts the time in seconds into a date using the %x formatter.
         * @param timeInSeconds
         * @returns {*}
         */
        date: function(timeInSeconds) {
            return _formatters.date(new Date(timeInSeconds*1000));
        },

        /**
         * Converts the value into a percentage.
         */
        percentage: function(value) {
            return _formatters.percentage(value);
        }
    });

/**
 * Created by rerobins on 10/6/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashPercentageFormat', PercentageDirectiveGenerator);

PercentageDirectiveGenerator.$inject = ['formatters'];

function PercentageDirectiveGenerator(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: link
    };

    //////////////////////////////////////////////////////////////////////////
    function link($scope) {
        if (angular.isNumber($scope.value())) {

            $scope.currencyValue = formatters.percentage($scope.value());

            if ($scope.value() > 0.0) {
                $scope.style = {color: 'green'};
            } else if ($scope.value() < 0.0) {
                $scope.style = {color: 'red'};
            }
        } else {
            $scope.currencyValue = 'N/A';
        }
    }

}

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

/**
 * Created by rerobins on 9/29/15.
 */
angular.module('gnucash-reports-view.reports')
    .directive('gnucashBoxPlot', BoxPlotDirectiveGenerator);

BoxPlotDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function BoxPlotDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/box_plot/boxPlotDirective.html',
        link: function($scope) {
            $timeout(buildChartConfiguration, 0, true, $scope);
        }
    };

    function buildChartConfiguration($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'boxPlotChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 100,
                    left: 100
                },
                color:[colorDefinitions.base],
                x: function(d){return d.label;},
                maxBoxWidth: 75,
                yDomain: [0, data.high],
                yAxis: {
                    tickFormat: formatters.currencyNoParts
                },
                transitionDuration: 0
            }
        };

        $scope.data = [
            {
                label: 'Data',
                values: {
                    Q1: data.q1,
                    Q2: data.q2,
                    Q3: data.q3,
                    whisker_low: data.low,
                    whisker_high: data.high,
                    outliers: []
                }
            }
        ];
    }
}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashBudgetLevel', BudgetlevelDirectiveGenerator);

BudgetlevelDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function BudgetlevelDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_level/budgetLevelDirective.html',
        link: function($scope) {
            $timeout(createBudgetLevelGraph, 0, true, $scope);
        }
    };

    ///////////////////////////////////////////////////////////////////////////

    function createBudgetLevelGraph($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                stacked: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }
            }
        };

        $scope.data = createDataSet(data.budgetValue, data.balance, data.today, data.daysInMonth);
        $scope.yearData = createDataSet(data.budgetValue * 12, data.yearlyBalance, data.currentYearDay, data.daysInYear);
    }

    function createDataSet(budgetValue, balance, currentDay, daysInPeriod) {
        var label = formatters.currency(budgetValue);

        var todayValue = (currentDay / daysInPeriod) * budgetValue;

        var data = null;

        if (balance > budgetValue) {
            data = [
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values : [
                        {
                            label: label,
                            value: todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Remaining Today',
                    color: colorDefinitions.base,
                    values : [
                        {
                            label: label,
                            value: budgetValue - todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Overage',
                    color: colorDefinitions.error,
                    values : [
                        {
                            label: label,
                            value: balance - budgetValue
                        }
                    ]
                }
            ];
        } else if (balance > todayValue) {
            // Build underage Chart
            data = [
                {
                    key: 'Today',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: todayValue
                        }
                    ]
                },
                {
                    key: 'Today Overage',
                    color: colorDefinitions.warning,
                    values : [
                        {
                            label: label,
                            value: balance - todayValue
                        }
                    ]
                },
                {
                    key: 'Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: budgetValue - balance
                        }
                    ]
                }
            ];

        } else {
            // Build overage Chart
            data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.best,
                    values : [
                        {
                            label: label,
                            value: balance
                        }
                    ]
                },
                {
                    key: 'Today',
                    color: colorDefinitions.good,
                    values : [
                        {
                            label: label,
                            value: todayValue - balance
                        }
                    ]
                },
                {
                    key : 'Today Budget Remaining',
                    color: colorDefinitions.base,
                    values: [
                        {
                            label: label,
                            value: budgetValue - todayValue
                        }
                    ]
                }
            ];
        }

        return data;
    }

}

/**
 * Created by rerobins on 9/29/15.
 */


angular.module('gnucash-reports-view.reports')
    .directive('gnucashBudgetPlanning', BudgetPlanningDirectiveGenerator);

BudgetPlanningDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function BudgetPlanningDirectiveGenerator($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_planning/budgetPlanningDirective.html',
        link: link
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    function link($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'pieChart',
                height: 350,
                x: function(d){return d.name;},
                y: function(d){return d.value;},
                showLabels: true,
                transitionDuration: 0,
                labelThreshold: 0.01,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 20,
                        left: 0
                    }
                },
                labelType: 'value',
                donut: true,
                labelsOutside: true,
                valueFormat: formatters.currency,
                labelSunbeamLayout: true
            }
        };

        $scope.income = data.income;
        $scope.total = data.income - data.remaining;
        $scope.remaining = data.remaining;
        $scope.budget = angular.copy(data.categories);
        $scope.data = angular.copy(data.categories);

        // Manipulate the data set and tye style based on the amount of remaining value that is in the accounts.
        $scope.remainingStyle = {background: colorDefinitions.totalGood};
        if ($scope.remaining < 0) {
            $scope.remainingStyle = {background: colorDefinitions.totalBad};
        } else {
            $scope.data.push({name: 'Remaining', value: data.remaining});
        }
    }
}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashCashFlow', CashFlowDirectiveGenerator);

CashFlowDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function CashFlowDirectiveGenerator($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/cash_flow_chart/cashFlowDirective.html',
        link: link
    };

    ///////////////////////////////////////////////////////////

    function link($scope) {
        var data = $scope.reportData();

        $timeout(function() {
            $scope.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 100
                    },
                    x: function(d){return d.date;},
                    y: function(d){return d.value;},
                    showControls: false,
                    showValues: true,
                    valueFormat: formatters.currency,
                    stacked: true,
                    transitionDuration: 0,
                    xAxis: {
                        axisLabel: 'Date',
                        tickFormat: formatters.date,
                        rotateLabels: 35,
                        showMaxMin: false
                    },
                    yAxis: {
                        axisLabel: 'USD',
                        axisLabelDistance: 35,
                        tickFormat: formatters.currencyNoParts
                    }
                }
            };

            data.debits.forEach(function(dataValue) {
                if (dataValue.value === 0) {
                    // TODO: Figure out how to do this so that it doesn't display as -0.0001 in the graph.
                    dataValue.value = -0.00001;
                }
            });


            $scope.data = [
                {
                    key: 'Credits',
                    bar: true,
                    color: colorDefinitions.credit,
                    values: data.credits
                },
                {
                    key: 'Debits',
                    bar: true,
                    color: colorDefinitions.debit,
                    values: data.debits
                }
            ];
        });
    }
}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashCategoryGraph', CategoryGraphDirectiveGenerator);

CategoryGraphDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function CategoryGraphDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/category/categoryGraphDirective.html',
        link: function($scope) {
            $timeout(createCategoryChart, 0, true, $scope);
        }
    };

    function createCategoryChart($scope) {
        var data = $scope.reportData();
        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showLegend: false,
                showValues: true,
                transitionDuration: 500,
                xAxis: {
                    showMaxMin: false
                },
                margin: {
                    left: 100,
                    right: 50
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return formatters.currency(d);
                    }
                }
            }
        };

        $scope.data = [
            {
                key: '',
                color: colorDefinitions.base,
                values: function() {
                    var result = [];

                    data.categories.forEach(function(d) {
                       result.push({
                           label: d[0],
                           value: d[1]
                       });
                    });

                    return result;
                }()
            }
        ];

        $scope.tableData = data.categories;
        $scope.total = 0;

        data.categories.forEach(function(d) {
            $scope.total += d[1];
        });
    }

}


/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashCreditUsage', CreditUsageDirectiveGenerator);

CreditUsageDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function CreditUsageDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/credit_usage/creditUsageDirective.html',
        link: function($scope) {
            $timeout(createCreditUsageChart, 0, true, $scope);
        }
    };

    function createCreditUsageChart ($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                stacked: true,
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }
        };

        var label = formatters.currency(data.credit_limit);

        $scope.data = [
            {
                key: 'Used',
                color: colorDefinitions.debit,
                values: [
                    {
                        label: label,
                        value: data.credit_amount
                    }
                ]
            },
            {
                key: 'Available',
                color: colorDefinitions.credit,
                values: [
                    {
                        label: label,
                        value: data.credit_limit - data.credit_amount
                    }
                ]
            }
        ];
    }

}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashDebtLiquidAsset', DebtLiquidAssetDirectiveGenerator);

DebtLiquidAssetDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function DebtLiquidAssetDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/debt_liquid_assets/debtLiquidAssetDirective.html',
        link: function($scope) {
            $timeout(createDebitLiquidAssetChart, 0, true, $scope);
        }
    };

    function createDebitLiquidAssetChart($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }
        };

        var label = 'Credit vs. LA';

        if (data.liquid_assets > data.credit_used) {
            $scope.data = [
                {
                    key: 'Credit Used',
                    color: colorDefinitions.warning,
                    values: [
                        {
                            label: label,
                            value: data.credit_used
                        }
                    ]
                },
                {
                    key: 'Liquid Assets',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.liquid_assets - data.credit_used
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = true;
        } else {
            $scope.data = [

                {
                    key: 'Liquid Assets',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.liquid_assets
                        }
                    ]
                },
                {
                    key: 'Overage',
                    color: colorDefinitions.error,
                    values: [
                        {
                            label: label,
                            value: data.credit_used - data.liquid_assets
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        }

    }

}
/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashExpensesPeriod', ExpensesPeriodDirectiveGenerator);

ExpensesPeriodDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function ExpensesPeriodDirectiveGenerator($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/expenses_period/expensesPeriodDirective.html',
        link: link
    };

    function link($scope) {
        var data = $scope.reportData();

        $timeout(function() {
            $scope.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 100
                    },
                    x: function(d){return d.date;},
                    y: function(d){return d.value;},
                    showValues: true,
                    valueFormat: formatters.currency,
                    showControls: false,
                    transitionDuration: 0,
                    xAxis: {
                        axisLabel: '',
                        tickFormat: formatters.date,
                        rotateLabels: 30,
                        showMaxMin: true
                    },
                    yAxis: {
                        axisLabel: 'Total Expenses',
                        axisLabelDistance: 35,
                        tickFormat: formatters.currencyNoParts,
                        showMaxMin: true
                    }
                }
            };

            $scope.data = [
                {
                    key : 'Expenses',
                    bar: false,
                    values : data.expenses,
                    color: colorDefinitions.base
                }
            ];

        });

    }
}

/**
 * Created by rerobins on 9/29/15.
 */
angular.module('gnucash-reports-view.reports')
    .directive('gnucashIncomeVsExpense', IncomeVsExpenseDirectiveGenerator);

IncomeVsExpenseDirectiveGenerator.$inject = ['colorDefinitions', 'formatters'];

function IncomeVsExpenseDirectiveGenerator(colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/income_vs_expense/income_vs_expenseDirective.html',
        link: link
    };

    function link($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 100,
                    left: 100
                },
                x: function(d){return d.date;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                valueFormat: formatters.currency,
                stacked: true,
                transitionDuration: 0,
                xAxis: {
                    axisLabel: 'Date',
                    tickFormat: formatters.date,
                    rotateLabels: 35,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'USD',
                    axisLabelDistance: 35,
                    tickFormat: formatters.currencyNoParts
                }
            }
        };

        data.expenses.forEach(function(dataValue) {
            if (dataValue.value === 0) {
                // TODO: Figure out how to do this so that it doesn't display as -0.0001 in the graph.
                dataValue.value = -0.00001;
            }
        });


        $scope.data = [
            {
                key : 'Income',
                bar: true,
                color: colorDefinitions.credit,
                values : data.income
            },
            {
                key : "Expenses" ,
                bar: true,
                color: colorDefinitions.debit,
                values : data.expenses
            }
        ];

        $scope.tableData = data;
    }
}

/**
 * Created by rerobins on 9/29/15.
 */


angular.module('gnucash-reports-view.reports')
    .directive('gnucashInvestmentBalance', InvestmentBalanceDirectiveGenerator);

InvestmentBalanceDirectiveGenerator.$inject = ['colorDefinitions', 'formatters'];

function InvestmentBalanceDirectiveGenerator(colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/investment_balance/investmentBalanceDirective.html',
        link: link
    };

    function link($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 60,
                    bottom: 100,
                    left: 100
                },
                color: [colorDefinitions.best, colorDefinitions.good, '#000000'],
                useInteractiveGuideline: true,
                useVoronoi: false,
                interpolate: false,
                transitionDuration: 0,
                toolTips: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: formatters.date
                },
                yAxis1: {
                    tickFormat: formatters.currency
                }
            }
        };

        $scope.data = [
            {
                "type": "area",
                "yAxis": 1,
                "key" : "Dividend" ,
                "values" : function() {
                    var results = [];
                    data.dividend.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                    });
                    return results;
                }()
            },

            {
                "type": "area",
                "yAxis": 1,
                "key" : "Purchases" ,
                "values" : function() {
                    var results = [];
                    data.purchases.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                    });
                    return results;
                }()
            },
            {
                "type": "line",
                "yAxis": 1,
                "key": "Value",
                "values": function() {
                    var results = [];
                    data.value.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                    });
                    return results;
                }()
            }

        ];
    }
}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashInvestmentTrend', InvestmentTrendDirectiveGenerator);

InvestmentTrendDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function InvestmentTrendDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/investment_trend/investment_trendDirective.html',
        link: function($scope) {
            $timeout(createInvestmentTrendChart, 0, true, $scope);
        }
    };

    function createInvestmentTrendChart($scope) {
        var data = $scope.reportData();

        var basisMax = 0.0;
        var increaseMax = 0.0;

        $scope.data = [
            {
                type: 'bar',
                yAxis: 1,
                key: 'Basis',
                values: function() {
                    var results = [];
                    data.basis.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        basisMax = Math.max(basisMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Purchase',
                values: function() {
                    var results = [];
                    data.money_in.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Dividends',
                values : function() {
                    var results = [];
                    data.income.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'bar',
                yAxis: 2,
                key: 'Expenses',
                values : function() {
                    var results = [];
                    data.expense.forEach(function(element) {
                        results.push({x: element[0], y: -element[1]});
                        increaseMax = Math.max(increaseMax, element[1]);
                    });
                    return results;
                }()
            },
            {
                type: 'line',
                yAxis: 1,
                key : 'Value',
                values : function() {
                    var results = [];
                    data.value.forEach(function(element) {
                        results.push({x: element[0], y: element[1]});
                        basisMax = Math.max(basisMax, element[1]);
                    });
                    return results;
                }()
            }

        ];

        $scope.options = {
            chart: {
                type: 'multiChart',
                height: 450,
                margin : {
                    top: 30,
                    right: 100,
                    bottom: 100,
                    left: 100
                },
                color: [
                    colorDefinitions.good, colorDefinitions.best,
                    colorDefinitions.info, colorDefinitions.error, '#000000'],
                useInteractiveGuideline: true,
                useVoronoi: false,
                interpolate: false,
                transitionDuration: 0,
                toolTips: true,
                yDomain1: [0, basisMax],
                yDomain2: [0, increaseMax],
                xAxis: {
                    showMaxMin: false,
                    tickFormat: formatters.date
                },
                yAxis1: {
                    tickFormat: formatters.currency
                },
                yAxis2: {
                    tickFormat: formatters.currency
                }
            }
        };
    }

}

/**
 * Created by rerobins on 10/6/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashNetWorthBreakdown', NetworthBreakdownDirectiveGenerator);

NetworthBreakdownDirectiveGenerator.$inject = ['formatters'];

function NetworthBreakdownDirectiveGenerator(formatters) {
    return {
        restrict: 'E',
        scope: {
            data: '&',
            deltas: '&',
            trends: '&',
            header: '&'
        },
        templateUrl: 'core/reports/net_worth_table/net_worth_breakdown.html'
    };
}

/**
 * Created by rerobins on 10/6/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashNetWorthSummary', NetworthSummaryDirectiveGenerator);

NetworthSummaryDirectiveGenerator.$inject = [];

function NetworthSummaryDirectiveGenerator() {
    return {
        restrict: 'E',
        scope: {
            assets: '&',
            liabilities: '&',
            netWorth: '&',
            deltas: '&',
            trends: '&'
        },
        templateUrl: 'core/reports/net_worth_table/net_worth_summary.html'
    };
}

/**
 * Created by rerobins on 9/29/15.
 */

angular.module('gnucash-reports-view.reports')
    .directive('gnucashNetWorth', NetworthDirectiveGenerator);

NetworthDirectiveGenerator.$inject = ['$timeout', 'formatters'];

function NetworthDirectiveGenerator($timeout, formatters) {
    return {
        restrict: 'E',
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/net_worth/net_worthDirective.html',
        link: link
    };

    function link($scope) {
        var data = $scope.reportData();

        $timeout(function() {

            $scope.options = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin : {
                        top: 30,
                        right: 60,
                        bottom: 100,
                        left: 100
                    },
                    x: function(d){return d.date;},
                    y: function(d){return d.value;},
                    color: d3.scale.category10().range(),
                    useInteractiveGuideline: true,
                    useVoronoi: false,
                    interpolate: false,
                    transitionDuration: 0,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: formatters.date
                    },
                    yAxis: {
                        tickFormat: formatters.currency
                    }
                }
            };

            $scope.data = [
                {
                    "key" : "Assets" ,
                    "values" : data.assets
                },

                {
                    "key" : "Liabilities" ,
                    "values" : data.liabilities
                },
                {
                    "key": "Inflation",
                    "values": data.inflation
                },
                {
                    "key": "Net",
                    "values": data.net
                }
            ];
        });
    }
}

/**
 * Register all of the core reports into the data system.
 */

angular.module('gnucash-reports-view.reports')
    .config(['ReportsManagementProvider', function(provider) {
        provider.addTemplate('401k_report', 'core/reports/401k_contribution/401k_report.html')
                .addTemplate('account_levels', 'core/reports/account_levels/account_levels.html')
                .addTemplate('expenses_box', 'core/reports/box_plot/box_plot.html')
                .addTemplate('budget_level', 'core/reports/budget_level/budget_level.html')
                .addTemplate('category_budget_level', 'core/reports/budget_level/budget_level.html')
                .addTemplate('budget_planning', 'core/reports/budget_planning/budget_planning.html')
                .addTemplate('cash_flow_chart', 'core/reports/cash_flow_chart/cash_flow.html')
                .addTemplate('account_usage_categories', 'core/reports/category/category.html')
                .addTemplate('expenses_categories', 'core/reports/category/category.html')
                .addTemplate('investment_allocation', 'core/reports/category/category.html')
                .addTemplate('expense_accounts', 'core/reports/category/category.html')
                .addTemplate('credit_usage', 'core/reports/credit_usage/credit_usage.html')
                .addTemplate('debt_vs_liquid_assets', 'core/reports/debt_liquid_assets/debt_liquid_assets.html')
                .addTemplate('expenses_period', 'core/reports/expenses_period/expenses_period.html')
                .addTemplate('income_vs_expense', 'core/reports/income_vs_expense/income_vs_expense.html')
                .addTemplate('investment_balance', 'core/reports/investment_balance/investment_balance.html')
                .addTemplate('investment_trend', 'core/reports/investment_trend/investment_trend.html')
                .addTemplate('multi_report', 'core/reports/multi_report/multi_report.html')
                .addTemplate('net_worth', 'core/reports/net_worth/net_worth.html')
                .addTemplate('net_worth_table', 'core/reports/net_worth_table/net_worth_table.html')
                .addTemplate('savings_goal', 'core/reports/savings_goal/savings_goal.html')
                .addTemplate('income_tax', 'core/reports/taxes_paid/taxes_paid.html');
    }]);
/**
 * Created by rerobins on 9/29/15.
 */




angular.module('gnucash-reports-view.reports')
    .directive('gnucashSavingsGoal', SavingsGoalDirectiveGenerator);

SavingsGoalDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function SavingsGoalDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/savings_goal/savingsGoalDirective.html',
        link: function($scope) {
            $timeout(createSavingsGoalChart, 0, true, $scope);
        }
    };

    function createSavingsGoalChart($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }


        };

        var label = formatters.currency(data.goal);

        if (data.balance < data.goal) {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.balance
                        }
                    ]
                },
                {
                    key: 'To Go',
                    color: colorDefinitions.error,
                    values: [
                        {
                            label: label,
                            value: data.goal - data.balance
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = true;
        } else {
            // Build overage Chart
            $scope.data = [
                {
                    key: 'Goal',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.goal
                        }
                    ]
                },
                {
                    key: 'Overage',
                    color: colorDefinitions.best,
                    values: [
                        {
                            label: label,
                            value: data.balance - data.goal
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        }

    }
}
/**
 * Created by rerobins on 9/29/15.
 */


angular.module('gnucash-reports-view.reports')
    .directive('gnucashTaxesPaid', TaxesPaidDirectiveGenerator);


TaxesPaidDirectiveGenerator.$inject = ['$timeout', 'colorDefinitions', 'formatters'];

function TaxesPaidDirectiveGenerator($timeout, colorDefinitions, formatters) {

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/taxes_paid/taxes_paidDirective.html',
        link: function($scope) {
            $timeout(createTaxesPaidGraph, 0, true, $scope);
        }
    };

    function createTaxesPaidGraph($scope) {
        var data = $scope.reportData();

        $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                transitionDuration: 0,
                tooltip: {
                    valueFormatter: formatters.currency
                },
                tickFormat: formatters.currencyNoParts,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    ticks: 15,
                    axisLabel: 'USD',
                    tickFormat: formatters.currencyNoParts
                },
                margin: {
                    left: 75,
                    right: 75
                }

            }
        };

        var label = formatters.currency(data.tax_value);

        if (data.taxes_paid > data.tax_value) {
            $scope.data = [
                {
                    key: 'Taxes Owed',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.tax_value
                        }
                    ]
                },
                {
                    key: 'Overpayment',
                    color: colorDefinitions.error,
                    values: [
                        {
                            label: label,
                            value: data.taxes_paid - data.tax_value
                        }
                    ]
                }
            ];
            $scope.options.chart.stacked = false;
        } else {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Taxes Paid',
                    color: colorDefinitions.good,
                    values: [
                        {
                            label: label,
                            value: data.taxes_paid
                        }
                    ]
                }];

            if (data.tax_value > data.taxes_paid)
            {
                $scope.data.push({
                    key: 'Taxes Owed',
                    color: colorDefinitions.warning,
                    values: [
                        {
                            label: label,
                            value: data.tax_value - data.taxes_paid
                        }
                    ]
                });
            }


            $scope.options.chart.stacked = true;
        }
    }

}



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


angular.module('gnucash-reports-view')
    .controller('SideMenuController', SideMenuController);

SideMenuController.$inject = ['ReportsService'];

// Side menu controller.
function SideMenuController(ReportsService) {

    var controller = this;

    controller.reports = [];

    ReportsService.reportsContent.then(function(results) {
        controller.reports = results.data.reports;
    });

}

angular.module('gnucash-reports-view').run(['$templateCache', function($templateCache) {$templateCache.put('core/descriptionDialog.html','<md-dialog aria-label="Mango (Fruit)" ng-cloak>\n    <form>\n        <md-toolbar>\n            <div class="md-toolbar-tools">\n                <h2>Description: {{name}}</h2>\n                <span flex></span>\n                <md-button class="md-icon-button" ng-click="cancel()">\n                    <ng-md-icon icon="close"></ng-md-icon>\n                </md-button>\n            </div>\n        </md-toolbar>\n        <md-dialog-content style="max-width:800px;max-height:810px">\n            <div>\n                <p>\n                   {{description}}\n                </p>\n            </div>\n        </md-dialog-content>\n    </form>\n</md-dialog>\n');
$templateCache.put('core/display.html','<md-toolbar class="md-toolbar-tools md-primary md-hue-3">\n    <md-button class="md-icon-button" aria-label="Settings" ng-click="displayController.toggleLeft()" hide-gt-lg>\n        <ng-md-icon icon="menu" style="fill: white"></ng-md-icon>\n    </md-button>\n    <h2>\n        <span>\n            {{displayController.page_definition.name}}\n        </span>\n    </h2>\n</md-toolbar>\n\n<md-content layout-padding flex layout-fill>\n    <gnucash-report ng-repeat="report in displayController.page_definition.reports" report="report"></gnucash-report>\n</md-content>\n');
$templateCache.put('core/main.html','<md-toolbar class="md-toolbar-tools">\n    <md-button class="md-icon-button" aria-label="Settings" ng-click="controller.toggleLeft()" hide-gt-lg>\n        <ng-md-icon icon="menu" style="fill: white"></ng-md-icon>\n    </md-button>\n    <h2>\n        <span>\n            Main Display\n        </span>\n    </h2>\n</md-toolbar>\n\n<md-content layout-padding flex layout-fill>\n\n    <p>Gnucash File Modified: {{controller.modificationDate}}</p>\n    <p>Last Updated: {{controller.lastUpdated}}</p>\n\n</md-content>');
$templateCache.put('core/reportDirective.html','<div layout="column">\n    <div layout="row">\n        <div flex>\n            <h2>{{report().name}}</h2>\n        </div>\n        <div>\n            <md-button aria-label="Description" ng-if="report().description">\n                <ng-md-icon icon="info_outline" size="36" ng-click="displayDescription()"></ng-md-icon>\n            </md-button>\n        </div>\n    </div>\n\n    <div ng-include="template"></div>\n</div>\n\n');
$templateCache.put('core/reports/401k_contribution/401k_report.html','<div flex>\n    <gnucash-contribution401k report-data="reportData()"></gnucash-contribution401k>\n</div>');
$templateCache.put('core/reports/401k_contribution/401k_reportDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/account_levels/account_levels.html','<div flex>\n    <gnucash-account-level report-data="reportData()"></gnucash-account-level>\n</div>');
$templateCache.put('core/reports/account_levels/accountLevelDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n</div>');
$templateCache.put('core/reports/box_plot/box_plot.html','<div flex>\n    <gnucash-box-plot report-data="::reportData()"></gnucash-box-plot>\n</div>');
$templateCache.put('core/reports/box_plot/boxPlotDirective.html','<div flex>\n    <nvd3 options="::options" data="::data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/budget_level/budget_level.html','<div flex>\n    <gnucash-budget-level report-data="reportData()"></gnucash-budget-level>\n</div>');
$templateCache.put('core/reports/budget_level/budgetLevelDirective.html','<div flex>\n\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="monthly">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="yearly" ng-if="yearData">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="yearData" ng-if="yearData"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n\n</div>');
$templateCache.put('core/reports/budget_planning/budget_planning.html','<div flex>\n    <gnucash-budget-planning report-data="reportData()"></gnucash-budget-planning>\n</div>');
$templateCache.put('core/reports/budget_planning/budgetPlanningDirective.html','<div flex layout="row">\n\n    <div flex>\n        <nvd3 options="options" data="data"></nvd3>\n    </div>\n\n    <div style="height: 400px; overflow-y: scroll; overflow-x: hidden">\n        <md-table-container>\n            <table md-table>\n                <thead md-head>\n                    <tr md-row>\n                        <th md-column>Category</th>\n                        <th md-column>Value</th>\n                    </tr>\n                </thead>\n                <tbody md-body>\n                    <tr md-row ng-repeat="item in budget track by $index">\n                        <td md-cell>{{item.name}}</td>\n                        <td md-cell>{{item.value | currency}}</td>\n                    </tr>\n\n                    <tr md-row style="background: aliceblue">\n                        <td md-cell>Total</td>\n                        <td md-cell>{{total | currency}}</td>\n                    </tr>\n                    <tr md-row>\n                        <td md-cell>Income</td>\n                        <td md-cell>{{income | currency}}</td>\n                    </tr>\n                    <tr md-row ng-style="remainingStyle">\n                        <td md-cell>Remaining</td>\n                        <td md-cell>{{remaining | currency}}</td>\n                    </tr>\n                </tbody>\n            </table>\n        </md-table-container>\n    </div>\n</div>');
$templateCache.put('core/reports/cash_flow_chart/cash_flow.html','<div flex>\n    <gnucash-cash-flow report-data="reportData()"></gnucash-cash-flow>\n</div>');
$templateCache.put('core/reports/cash_flow_chart/cashFlowDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                                <th md-column>Net</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                                <td md-cell>\n                                    <gnucash-currency-format value="data[0].values[i].value + data[1].values[i].value"></gnucash-currency-format>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/category/category.html','<div flex>\n    <gnucash-category-graph report-data="::reportData()"></gnucash-category-graph>\n</div>');
$templateCache.put('core/reports/category/categoryGraphDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Category</th>\n                                <th md-column>Value</th>\n                                <th md-column>Percentage</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="dataset in tableData track by dataset[0]">\n                                <td md-cell style="text-transform: uppercase">{{::dataset[0]}}</td>\n                                <td md-cell>{{::dataset[1] | currency}}</td>\n                                <td md-cell><gnucash-percentage-format value="dataset[1] / total"></gnucash-percentage-format></td>\n                            </tr>\n                            <tr md-row style="background-color: lightblue">\n                                <td md-cell style="text-transform: uppercase">Total</td>\n                                <td md-cell>{{::total | currency}}</td>\n                                <td md-cell>&nbsp;</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/credit_usage/credit_usage.html','<div flex>\n    <gnucash-credit-usage report-data="reportData()"></gnucash-credit-usage>\n</div>');
$templateCache.put('core/reports/credit_usage/creditUsageDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/debt_liquid_assets/debt_liquid_assets.html','<div flex>\n    <gnucash-debt-liquid-asset report-data="reportData()"></gnucash-debt-liquid-asset>\n</div>');
$templateCache.put('core/reports/debt_liquid_assets/debtLiquidAssetDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/expenses_period/expenses_period.html','<div flex>\n    <gnucash-expenses-period report-data="::reportData()"></gnucash-expenses-period>\n</div>');
$templateCache.put('core/reports/expenses_period/expensesPeriodDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/income_vs_expense/income_vs_expense.html','<div flex>\n    <gnucash-income-vs-expense report-data="reportData()"></gnucash-income-vs-expense>\n</div>');
$templateCache.put('core/reports/income_vs_expense/income_vs_expenseDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data"></nvd3>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column>Income</th>\n                                <th md-column>Expenses</th>\n                                <th md-column>Net</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in reportData().net track by $index" ng-init="i = $index">\n                                <td md-cell>{{firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell><gnucash-currency-format value="reportData().income[i].value"></gnucash-currency-format></td>\n                                <td md-cell><gnucash-currency-format value="reportData().expenses[i].value"></gnucash-currency-format></td>\n                                <td md-cell><gnucash-currency-format value="reportData().net[i].value"></gnucash-currency-format></td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/investment_balance/investment_balance.html','<div flex>\n    <gnucash-investment-balance report-data="reportData()"></gnucash-investment-balance>\n</div>');
$templateCache.put('core/reports/investment_balance/investmentBalanceDirective.html','<div flex>\n    <nvd3 options="options" data="data"></nvd3>\n</div>');
$templateCache.put('core/reports/investment_trend/investment_trend.html','<div flex>\n    <gnucash-investment-trend report-data="reportData()"></gnucash-investment-trend>\n</div>');
$templateCache.put('core/reports/investment_trend/investment_trendDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                                <th md-column>Value Difference</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.x * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].y | currency}}</td>\n                                <td md-cell>\n                                    <gnucash-currency-format value="data[4].values[i].y-data[0].values[i].y"></gnucash-currency-format>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/multi_report/multi_report.html','<div flex layout="row">\n    <gnucash-report report="report" ng-repeat="report in reportData().reports" flex>\n\n    </gnucash-report>\n</div>');
$templateCache.put('core/reports/net_worth_table/net_worth_breakdown.html','\n<md-table-container>\n    <table md-table>\n        <thead md-head>\n            <tr md-row>\n                <th md-column width="30%">{{header()}}</th>\n                <th md-column ng-repeat="date in trends() track by $index">{{date*1000 | date : \'MMM yyyy\'}}</th>\n                <th md-column style="background-color: lightcyan">Current</th>\n                <th md-column ng-repeat="delta in deltas() track by $index">&Delta; {{-delta}} Months</th>\n            </tr>\n        </thead>\n        <tbody md-body>\n            <tr md-row ng-repeat="row in data().records">\n                <td md-cell style="text-transform: uppercase">{{row.name}}</td>\n                <td md-cell ng-repeat="value in row.trend track by $index">\n                    <gnucash-currency-format value="value"></gnucash-currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <gnucash-currency-format value="row.current_data"></gnucash-currency-format>\n                </td>\n                <td md-cell ng-repeat="value in row.deltas track by $index">\n                    <gnucash-percentage-format value="value"></gnucash-percentage-format>\n                </td>\n            </tr>\n\n            <tr md-row style="background-color: aliceblue">\n                <td md-cell style="text-transform: uppercase"><strong>Totals</strong></td>\n                <td md-cell ng-repeat="value in data().trend track by $index">\n                    <gnucash-currency-format value="value"></gnucash-currency-format>\n                </td>\n                <td md-cell>\n                    <gnucash-currency-format value="data().current_data"></gnucash-currency-format>\n                </td>\n                <td md-cell ng-repeat="value in data().deltas track by $index">\n                    <gnucash-percentage-format value="value"></gnucash-percentage-format>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</md-table-container>\n');
$templateCache.put('core/reports/net_worth_table/net_worth_summary.html','\n<md-table-container>\n    <table md-table>\n        <thead md-head>\n            <tr md-row>\n                <th md-column width="30%">{{header()}}</th>\n                <th md-column ng-repeat="date in trends() track by $index">{{date*1000 | date : \'MMM yyyy\'}}</th>\n                <th md-column style="background-color: lightcyan">Current</th>\n                <th md-column ng-repeat="delta in deltas() track by $index">&Delta; {{-delta}} Months</th>\n            </tr>\n        </thead>\n        <tbody md-body>\n            <tr md-row>\n                <td md-cell width="30%" style="text-transform: uppercase">Assets</td>\n                <td md-cell ng-repeat="value in assets().trend track by $index">\n                    <gnucash-currency-format value="value"></gnucash-currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <gnucash-currency-format value="assets().current_data"></gnucash-currency-format>\n                </td>\n                <td md-cell ng-repeat="value in assets().deltas track by $index">\n                    <gnucash-percentage-format value="value"></gnucash-percentage-format>\n                </td>\n            </tr>\n\n            <tr md-row>\n                <td md-cell style="text-transform: uppercase">Liabilities</td>\n                <td md-cell ng-repeat="value in liabilities().trend track by $index">\n                    <gnucash-currency-format value="value"></gnucash-currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <gnucash-currency-format value="liabilities().current_data"></gnucash-currency-format>\n                </td>\n                <td md-cell ng-repeat="value in liabilities().deltas track by $index">\n                    <gnucash-percentage-format value="value"></gnucash-percentage-format>\n                </td>\n            </tr>\n\n\n            <tr md-row style="background-color: lightblue">\n                <td md-cell style="text-transform: uppercase"><strong>Totals</strong></td>\n                <td md-cell ng-repeat="value in netWorth().trend track by $index">\n                    <gnucash-currency-format value="value"></gnucash-currency-format>\n                </td>\n                <td md-cell>\n                    <gnucash-currency-format value="netWorth().current_data"></gnucash-currency-format>\n                </td>\n                <td md-cell ng-repeat="value in netWorth().deltas track by $index">\n                    <gnucash-percentage-format value="value"></gnucash-percentage-format>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</md-table-container>\n');
$templateCache.put('core/reports/net_worth_table/net_worth_table.html','<gnucash-net-worth-breakdown header="\'Assets\'" data="reportData().assets" deltas="reportData().deltas" trends="reportData().trend"></gnucash-net-worth-breakdown>\n\n<div><p>&nbsp;</p></div>\n\n<gnucash-net-worth-breakdown header="\'Liabilities\'" data="reportData().liability" deltas="reportData().deltas" trends="reportData().trend"></gnucash-net-worth-breakdown>\n\n<div><p>&nbsp;</p></div>\n\n<gnucash-net-worth-summary assets="reportData().assets" liabilities="reportData().liability" deltas="reportData().deltas" trends="reportData().trend" net-worth="reportData().net_worth"></gnucash-net-worth-summary>');
$templateCache.put('core/reports/net_worth/net_worth.html','<div flex>\n    <gnucash-net-worth report-data="reportData()"></gnucash-net-worth>\n</div>');
$templateCache.put('core/reports/net_worth/net_worthDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/savings_goal/savings_goal.html','<div flex>\n    <gnucash-savings-goal report-data="::reportData()"></gnucash-savings-goal>\n</div>');
$templateCache.put('core/reports/savings_goal/savingsGoalDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/taxes_paid/taxes_paid.html','<div flex>\n    <gnucash-taxes-paid report-data="reportData()"></gnucash-taxes-paid>\n</div>');
$templateCache.put('core/reports/taxes_paid/taxes_paidDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/sidemenu.html','\n<md-toolbar class="md-theme-indigo">\n    <h1 class="md-toolbar-tools">Reports</h1>\n</md-toolbar>\n<md-content layout="column" flex>\n    <div layout="column" flex>\n        <md-button class="md-raised" md-no-ink ui-sref="main" ui-sref-active="md-primary">\n            <ng-md-icon icon="home" style="fill: gray"></ng-md-icon>\n            Home\n        </md-button>\n        <md-button class="md-raised" md-no-ink ng-repeat="report in controller.reports" ui-sref="report({report: report.file})" ui-sref-active="md-primary">\n            {{report.name}}\n        </md-button>\n    </div>\n</md-content>\n');}]);