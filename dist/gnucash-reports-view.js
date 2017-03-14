// Define the application.
angular.module('gnucash-reports-view', ['ngMaterial', 'ui.router', 'gnucash-reports-view.reports', 'ngMdIcons'])
    .config(['$urlRouterProvider', function($urlRouterProvider) {
        $urlRouterProvider.otherwise('/main');
    }]);

angular.module('gnucash-reports-view.reports', [
    'nvd3',
    'md.data.table',
    'ngMaterial']);


var DisplayController = function($mdUtil, $mdSidenav, $timeout, content) {

    var controller = this;

    $timeout(function() {
        controller.page_definition = content;
    });

    controller.toggleLeft = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle();
        }, 200);
        return debounceFn;
    }
};

angular.module('gnucash-reports-view')
    .controller('DisplayController', ['$mdUtil', '$mdSidenav', '$timeout', 'content', DisplayController])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('report', {
            url: '/report/:report',
            controller: 'DisplayController',
            templateUrl: 'src/core/DisplayController.html',
            controllerAs: 'displayController',
            resolve: {
                content: function(ReportsService, $stateParams) {
                    return ReportsService.loadPage($stateParams.report);
                }
            }
        });
    }]);


var MainDisplayController = function($mdUtil, $mdSidenav, ReportsService) {
    var controller = this;

    controller.toggleLeft = buildToggler('left');

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
                .toggle();
        }, 200);
        return debounceFn;
    }

    ReportsService.reportsContent.then(function(results) {
        controller.lastUpdated = results.last_updated;
        controller.modificationDate = results.modification_time;
    });
};

angular.module('gnucash-reports-view')
    .controller('MainDisplay', ['$mdUtil', '$mdSidenav', 'ReportsService', MainDisplayController])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider.state('main', {
            url: '/main',
            controller: 'MainDisplay',
            controllerAs: 'controller',
            templateUrl: 'src/core/MainDisplay.html'
        });
    }]);

/**
 * Directive that is responsible displaying the report data for each report.
 */
var ReportDirectiveGenerator = function($mdDialog, ReportsManagement) {
    return {
        scope: {
            report: '&'
        },
        templateUrl: 'src/core/reportDirective.html',
        link: function($scope) {

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
    };
};

angular.module('gnucash-reports-view')
    .directive('gnucashReport', ['$mdDialog', 'ReportsManagement', ReportDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var Contribution401kDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var create401kContributionGraph = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/401k_contribution/401k_reportDirective.html',
        link: function($scope) {
            $timeout(create401kContributionGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('contribution401k', ['$timeout', 'colorDefinitions', 'formatters', Contribution401kDirectiveGenerator]);
/**
 * Directive that will display the account level information on the display.
 */
var AccountLevelDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    /**
     * Translate the values of the data report into something that can be rendered.
     * @param $scope
     */
    var createAccountLevelGraph = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/account_levels/accountLevelDirective.html',
        link: function($scope) {
            $timeout(createAccountLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('accountLevel', ['$timeout', 'colorDefinitions', 'formatters', AccountLevelDirectiveGenerator]);
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
var CurrencyDirectiveGenerator = function(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: function($scope) {
            $scope.currencyValue = formatters.currency($scope.value());

            if ($scope.value() > 0.0) {
                $scope.style = {color: 'green'};
            } else if ($scope.value() < 0.0) {
                $scope.style = {color: 'red'};
            }
        }
    };

};

angular.module('gnucash-reports-view.reports')
    .directive('currencyFormat', ['formatters', CurrencyDirectiveGenerator]);


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
var PercentageDirectiveGenerator = function(formatters) {

    return {
        scope: {
            value: '&'
        },
        template: '<span ng-style="style">{{currencyValue}}</span>',
        link: function($scope) {

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
    };

};

angular.module('gnucash-reports-view.reports')
    .directive('percentageFormat', ['formatters', PercentageDirectiveGenerator]);


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
/**
 * Created by rerobins on 9/29/15.
 */
var BoxPlotDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var buildChartConfiguration = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/box_plot/boxPlotDirective.html',
        link: function($scope) {
            $timeout(buildChartConfiguration, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('boxPlot', ['$timeout', 'colorDefinitions', 'formatters', BoxPlotDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var BudgetlevelDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createDataSet = function(budgetValue, balance, currentDay, daysInPeriod) {
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
    };

    var createBudgetLevelGraph = function($scope) {
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

    };



    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_level/budgetLevelDirective.html',
        link: function($scope) {
            $timeout(createBudgetLevelGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('budgetLevel', ['$timeout', 'colorDefinitions', 'formatters', BudgetlevelDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var BudgetPlanningDirectiveGenerator = function($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/budget_planning/budgetPlanningDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('budgetPlanning', ['$timeout', 'colorDefinitions', 'formatters', BudgetPlanningDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var CashFlowDirectiveGenerator = function($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/cash_flow_chart/cashFlowDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('cashFlow', ['$timeout', 'colorDefinitions', 'formatters', CashFlowDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var CategoryGraphDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createCategoryChart = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/category/categoryGraphDirective.html',
        link: function($scope) {
            $timeout(createCategoryChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('categoryGraph', ['$timeout', 'colorDefinitions', 'formatters', CategoryGraphDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var CreditUsageDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createCreditUsageChart = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/credit_usage/creditUsageDirective.html',
        link: function($scope) {
            $timeout(createCreditUsageChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('creditUsage', ['$timeout', 'colorDefinitions', 'formatters', CreditUsageDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var DebtLiquidAssetDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createDebitLiquidAssetChart = function($scope) {
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

    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/debt_liquid_assets/debtLiquidAssetDirective.html',
        link: function($scope) {
            $timeout(createDebitLiquidAssetChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('debtLiquidAsset', ['$timeout', 'colorDefinitions', 'formatters', DebtLiquidAssetDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var ExpensesPeriodDirectiveGenerator = function($timeout, colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/expenses_period/expensesPeriodDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('expensesPeriod', ['$timeout', 'colorDefinitions', 'formatters', ExpensesPeriodDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var IncomeVsExpenseDirectiveGenerator = function(colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/income_vs_expense/income_vs_expenseDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('incomeVsExpense', ['colorDefinitions', 'formatters', IncomeVsExpenseDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var InvestmentBalanceDirectiveGenerator = function(colorDefinitions, formatters) {
    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/investment_balance/investmentBalanceDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('investmentBalance', ['colorDefinitions', 'formatters', InvestmentBalanceDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var InvestmentTrendDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createInvestmentTrendChart = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/investment_trend/investment_trendDirective.html',
        link: function($scope) {
            $timeout(createInvestmentTrendChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('investmentTrend', ['$timeout', 'colorDefinitions', 'formatters', InvestmentTrendDirectiveGenerator]);
/**
 * Created by rerobins on 10/6/15.
 */
var NetworthBreakdownDirectiveGenerator = function(formatters) {
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
};

angular.module('gnucash-reports-view.reports')
    .directive('netWorthBreakdown', ['formatters', NetworthBreakdownDirectiveGenerator]);
/**
 * Created by rerobins on 10/6/15.
 */
var NetworthSummaryDirectiveGenerator = function() {
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
};

angular.module('gnucash-reports-view.reports')
    .directive('netWorthSummary', [NetworthSummaryDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var NetworthDirectiveGenerator = function($timeout, formatters) {
    return {
        restrict: 'E',
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/net_worth/net_worthDirective.html',
        link: function($scope) {
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
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('netWorth', ['$timeout', 'formatters', NetworthDirectiveGenerator]);
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
var SavingsGoalDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createSavingsGoalChart = function($scope) {
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

        var label = formatters.currency(data.goal);

        if (data.balance < data.goal) {
            // Build underage Chart
            $scope.data = [
                {
                    key: 'Balance',
                    color: colorDefinitions.good,
                    values : [
                        {
                            label: label,
                            value: data.balance
                        }
                    ]
                },
                {
                    key: 'To Go',
                    color: colorDefinitions.error,
                    values : [
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

    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/savings_goal/savingsGoalDirective.html',
        link: function($scope) {
            $timeout(createSavingsGoalChart, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('savingsGoal', ['$timeout', 'colorDefinitions', 'formatters', SavingsGoalDirectiveGenerator]);
/**
 * Created by rerobins on 9/29/15.
 */
var TaxesPaidDirectiveGenerator = function($timeout, colorDefinitions, formatters) {

    var createTaxesPaidGraph = function($scope) {
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
    };

    return {
        scope: {
            reportData: '&'
        },
        templateUrl: 'core/reports/taxes_paid/taxes_paidDirective.html',
        link: function($scope) {
            $timeout(createTaxesPaidGraph, 0, true, $scope);
        }
    };
};

angular.module('gnucash-reports-view.reports')
    .directive('taxesPaid', ['$timeout', 'colorDefinitions', 'formatters', TaxesPaidDirectiveGenerator]);
// Service provider responsible for loading the reports and creating the pages.
var ReportsService = function($http, $q, reportFile) {

    var service = this;

    var my_data = null;

    service.reportsContent = $http.get(reportFile).then(function(res) {
        my_data = res.data;
        return res.data;
    });

    service.loadPage = function(page) {

        return $q(function(resolve, reject) {

            service.reportsContent.then(function(data) {
                var found = false;
                angular.forEach(data.reports, function(report) {
                    if (report.file === page) {
                        found = true;
                    }
                });

                if (found) {
                    return $http.get('data/' + page).then(function(res) {
                        console.log('res.data', res.data);
                        resolve(res.data);
                    });
                } else {
                    reject('Couldn"t find page definition');
                }
            });

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

    this.$get = ['$http', '$q', function($http, $q) {
        return ReportsService($http, $q, provider.reportFile);
    }];

};

angular.module('gnucash-reports-view')
    .provider('ReportsService', ReportsServiceProvider);
// Side menu controller.
var SideMenuController = function(ReportsService) {

    var controller = this;

    controller.reports = [];

    ReportsService.reportsContent.then(function(results) {
        controller.reports = results.reports;
    });

};

angular.module('gnucash-reports-view')
    .controller('SideMenuController', ['ReportsService', SideMenuController]);
angular.module('gnucash-reports-view').run(['$templateCache', function($templateCache) {$templateCache.put('core/descriptionDialog.html','<md-dialog aria-label="Mango (Fruit)" ng-cloak>\n    <form>\n        <md-toolbar>\n            <div class="md-toolbar-tools">\n                <h2>Description: {{name}}</h2>\n                <span flex></span>\n                <md-button class="md-icon-button" ng-click="cancel()">\n                    <ng-md-icon icon="close"></ng-md-icon>\n                </md-button>\n            </div>\n        </md-toolbar>\n        <md-dialog-content style="max-width:800px;max-height:810px">\n            <div>\n                <p>\n                   {{description}}\n                </p>\n            </div>\n        </md-dialog-content>\n    </form>\n</md-dialog>\n');
$templateCache.put('core/DisplayController.html','<md-toolbar class="md-toolbar-tools md-primary md-hue-3">\n    <md-button class="md-icon-button" aria-label="Settings" ng-click="displayController.toggleLeft()" hide-gt-lg>\n        <ng-md-icon icon="menu" style="fill: white"></ng-md-icon>\n    </md-button>\n    <h2>\n        <span>\n            {{displayController.page_definition.name}}\n        </span>\n    </h2>\n</md-toolbar>\n\n<md-content layout-padding flex layout-fill>\n    <gnucash-report ng-repeat="report in displayController.page_definition.reports" report="report"></gnucash-report>\n</md-content>\n');
$templateCache.put('core/MainDisplay.html','<md-toolbar class="md-toolbar-tools">\n    <md-button class="md-icon-button" aria-label="Settings" ng-click="controller.toggleLeft()" hide-gt-lg>\n        <ng-md-icon icon="menu" style="fill: white"></ng-md-icon>\n    </md-button>\n    <h2>\n        <span>\n            Main Display\n        </span>\n    </h2>\n</md-toolbar>\n\n<md-content layout-padding flex layout-fill>\n\n    <p>Gnucash File Modified: {{controller.modificationDate}}</p>\n    <p>Last Updated: {{controller.lastUpdated}}</p>\n\n</md-content>');
$templateCache.put('core/reportDirective.html','<div layout="column">\n    <div layout="row">\n        <div flex>\n            <h2>{{report().name}}</h2>\n        </div>\n        <div>\n            <md-button aria-label="Description" ng-if="report().description">\n                <ng-md-icon icon="info_outline" size="36" ng-click="displayDescription()"></ng-md-icon>\n            </md-button>\n        </div>\n    </div>\n\n    <div ng-include="template"></div>\n</div>\n\n');
$templateCache.put('core/reports/401k_contribution/401k_report.html','<div flex>\n    <contribution401k report-data="reportData()"></contribution401k>\n</div>');
$templateCache.put('core/reports/401k_contribution/401k_reportDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/account_levels/account_levels.html','<div flex>\n    <account-level report-data="reportData()"></account-level>\n</div>');
$templateCache.put('core/reports/account_levels/accountLevelDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n</div>');
$templateCache.put('core/reports/box_plot/box_plot.html','<div flex>\n    <box-plot report-data="::reportData()"></box-plot>\n</div>');
$templateCache.put('core/reports/box_plot/boxPlotDirective.html','<div flex>\n    <nvd3 options="::options" data="::data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/budget_level/budget_level.html','<div flex>\n    <budget-level report-data="reportData()"></budget-level>\n</div>');
$templateCache.put('core/reports/budget_level/budgetLevelDirective.html','<div flex>\n\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="monthly">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="yearly" ng-if="yearData">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="yearData" ng-if="yearData"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n\n</div>');
$templateCache.put('core/reports/budget_planning/budget_planning.html','<div flex>\n    <budget-planning report-data="reportData()"></budget-planning>\n</div>');
$templateCache.put('core/reports/budget_planning/budgetPlanningDirective.html','<div flex layout="row">\n\n    <div flex>\n        <nvd3 options="options" data="data"></nvd3>\n    </div>\n\n    <div style="height: 400px; overflow-y: scroll; overflow-x: hidden">\n        <md-table-container>\n            <table md-table>\n                <thead md-head>\n                    <tr md-row>\n                        <th md-column>Category</th>\n                        <th md-column>Value</th>\n                    </tr>\n                </thead>\n                <tbody md-body>\n                    <tr md-row ng-repeat="item in budget track by $index">\n                        <td md-cell>{{item.name}}</td>\n                        <td md-cell>{{item.value | currency}}</td>\n                    </tr>\n\n                    <tr md-row style="background: aliceblue">\n                        <td md-cell>Total</td>\n                        <td md-cell>{{total | currency}}</td>\n                    </tr>\n                    <tr md-row>\n                        <td md-cell>Income</td>\n                        <td md-cell>{{income | currency}}</td>\n                    </tr>\n                    <tr md-row ng-style="remainingStyle">\n                        <td md-cell>Remaining</td>\n                        <td md-cell>{{remaining | currency}}</td>\n                    </tr>\n                </tbody>\n            </table>\n        </md-table-container>\n    </div>\n</div>');
$templateCache.put('core/reports/cash_flow_chart/cash_flow.html','<div flex>\n    <cash-flow report-data="reportData()"></cash-flow>\n</div>');
$templateCache.put('core/reports/cash_flow_chart/cashFlowDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                                <th md-column>Net</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                                <td md-cell>\n                                    <currency-format value="data[0].values[i].value + data[1].values[i].value"></currency-format>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/category/category.html','<div flex>\n    <category-graph report-data="::reportData()"></category-graph>\n</div>');
$templateCache.put('core/reports/category/categoryGraphDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Category</th>\n                                <th md-column>Value</th>\n                                <th md-column>Percentage</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="dataset in tableData track by dataset[0]">\n                                <td md-cell style="text-transform: uppercase">{{::dataset[0]}}</td>\n                                <td md-cell>{{::dataset[1] | currency}}</td>\n                                <td md-cell><percentage-format value="dataset[1] / total"></percentage-format></td>\n                            </tr>\n                            <tr md-row style="background-color: lightblue">\n                                <td md-cell style="text-transform: uppercase">Total</td>\n                                <td md-cell>{{::total | currency}}</td>\n                                <td md-cell>&nbsp;</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/credit_usage/credit_usage.html','<div flex>\n    <credit-usage report-data="reportData()"></credit-usage>\n</div>');
$templateCache.put('core/reports/credit_usage/creditUsageDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/debt_liquid_assets/debt_liquid_assets.html','<div flex>\n    <debt-liquid-asset report-data="reportData()"></debt-liquid-asset>\n</div>');
$templateCache.put('core/reports/debt_liquid_assets/debtLiquidAssetDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/expenses_period/expenses_period.html','<div flex>\n    <expenses-period report-data="::reportData()"></expenses-period>\n</div>');
$templateCache.put('core/reports/expenses_period/expensesPeriodDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/income_vs_expense/income_vs_expense.html','<div flex>\n    <income-vs-expense report-data="reportData()"></income-vs-expense>\n</div>');
$templateCache.put('core/reports/income_vs_expense/income_vs_expenseDirective.html','\n<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data"></nvd3>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column name="">Date</th>\n                                <th md-column>Income</th>\n                                <th md-column>Expenses</th>\n                                <th md-column>Net</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in reportData().net track by $index" ng-init="i = $index">\n                                <td md-cell>{{firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell><currency-format value="reportData().income[i].value"></currency-format></td>\n                                <td md-cell><currency-format value="reportData().expenses[i].value"></currency-format></td>\n                                <td md-cell><currency-format value="reportData().net[i].value"></currency-format></td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/investment_balance/investment_balance.html','<div flex>\n    <investment-balance report-data="reportData()"></investment-balance>\n</div>');
$templateCache.put('core/reports/investment_balance/investmentBalanceDirective.html','<div flex>\n    <nvd3 options="options" data="data"></nvd3>\n</div>');
$templateCache.put('core/reports/investment_trend/investment_trend.html','<div flex>\n    <investment-trend report-data="reportData()"></investment-trend>\n</div>');
$templateCache.put('core/reports/investment_trend/investment_trendDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column name="">Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                                <th md-column>Value Difference</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.x * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].y | currency}}</td>\n                                <td md-cell>\n                                    <currency-format value="data[4].values[i].y-data[0].values[i].y"></currency-format>\n                                </td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/multi_report/multi_report.html','<div flex layout="row">\n    <gnucash-report report="report" ng-repeat="report in reportData().reports" flex>\n\n    </gnucash-report>\n</div>');
$templateCache.put('core/reports/net_worth_table/net_worth_breakdown.html','\n<md-table-container>\n    <table md-table>\n        <thead md-head>\n            <tr md-row>\n                <th md-column width="30%">{{header()}}</th>\n                <th md-column ng-repeat="date in trends() track by $index">{{date*1000 | date : \'MMM yyyy\'}}</th>\n                <th md-column style="background-color: lightcyan">Current</th>\n                <th md-column ng-repeat="delta in deltas() track by $index">&Delta; {{-delta}} Months</th>\n            </tr>\n        </thead>\n        <tbody md-body>\n            <tr md-row ng-repeat="row in data().records">\n                <td md-cell style="text-transform: uppercase">{{row.name}}</td>\n                <td md-cell ng-repeat="value in row.trend track by $index">\n                    <currency-format value="value"></currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <currency-format value="row.current_data"></currency-format>\n                </td>\n                <td md-cell ng-repeat="value in row.deltas track by $index">\n                    <percentage-format value="value"></percentage-format>\n                </td>\n            </tr>\n\n            <tr md-row style="background-color: aliceblue">\n                <td md-cell style="text-transform: uppercase"><strong>Totals</strong></td>\n                <td md-cell ng-repeat="value in data().trend track by $index">\n                    <currency-format value="value"></currency-format>\n                </td>\n                <td md-cell>\n                    <currency-format value="data().current_data"></currency-format>\n                </td>\n                <td md-cell ng-repeat="value in data().deltas track by $index">\n                    <percentage-format value="value"></percentage-format>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</md-table-container>\n');
$templateCache.put('core/reports/net_worth_table/net_worth_summary.html','\n<md-table-container>\n    <table md-table>\n        <thead md-head>\n            <tr md-row>\n                <th md-column width="30%">{{header()}}</th>\n                <th md-column ng-repeat="date in trends() track by $index">{{date*1000 | date : \'MMM yyyy\'}}</th>\n                <th md-column style="background-color: lightcyan">Current</th>\n                <th md-column ng-repeat="delta in deltas() track by $index">&Delta; {{-delta}} Months</th>\n            </tr>\n        </thead>\n        <tbody md-body>\n            <tr md-row>\n                <td md-cell width="30%" style="text-transform: uppercase">Assets</td>\n                <td md-cell ng-repeat="value in assets().trend track by $index">\n                    <currency-format value="value"></currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <currency-format value="assets().current_data"></currency-format>\n                </td>\n                <td md-cell ng-repeat="value in assets().deltas track by $index">\n                    <percentage-format value="value"></percentage-format>\n                </td>\n            </tr>\n\n            <tr md-row>\n                <td md-cell style="text-transform: uppercase">Liabilities</td>\n                <td md-cell ng-repeat="value in liabilities().trend track by $index">\n                    <currency-format value="value"></currency-format>\n                </td>\n                <td md-cell style="background-color: lightcyan">\n                    <currency-format value="liabilities().current_data"></currency-format>\n                </td>\n                <td md-cell ng-repeat="value in liabilities().deltas track by $index">\n                    <percentage-format value="value"></percentage-format>\n                </td>\n            </tr>\n\n\n            <tr md-row style="background-color: lightblue">\n                <td md-cell style="text-transform: uppercase"><strong>Totals</strong></td>\n                <td md-cell ng-repeat="value in netWorth().trend track by $index">\n                    <currency-format value="value"></currency-format>\n                </td>\n                <td md-cell>\n                    <currency-format value="netWorth().current_data"></currency-format>\n                </td>\n                <td md-cell ng-repeat="value in netWorth().deltas track by $index">\n                    <percentage-format value="value"></percentage-format>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</md-table-container>\n');
$templateCache.put('core/reports/net_worth_table/net_worth_table.html','<net-worth-breakdown header="\'Assets\'" data="reportData().assets" deltas="reportData().deltas" trends="reportData().trend"></net-worth-breakdown>\n\n<div><p>&nbsp;</p></div>\n\n<net-worth-breakdown header="\'Liabilities\'" data="reportData().liability" deltas="reportData().deltas" trends="reportData().trend"></net-worth-breakdown>\n\n<div><p>&nbsp;</p></div>\n\n<net-worth-summary assets="reportData().assets" liabilities="reportData().liability" deltas="reportData().deltas" trends="reportData().trend" net-worth="reportData().net_worth"></net-worth-summary>');
$templateCache.put('core/reports/net_worth/net_worth.html','<div flex>\n    <net-worth report-data="reportData()"></net-worth>\n</div>');
$templateCache.put('core/reports/net_worth/net_worthDirective.html','<div flex>\n    <md-tabs md-dynamic-height md-border-bottom>\n        <md-tab label="graph">\n            <md-content class="md-padding">\n                <nvd3 options="options" data="data" ng-if="data"></nvd3>\n                <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n                    <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n                </div>\n            </md-content>\n        </md-tab>\n\n        <md-tab label="table" ng-if="data">\n            <md-content class="md-padding">\n\n\n                <md-table-container>\n                    <table md-table>\n                        <thead md-head>\n                            <tr md-row>\n                                <th md-column>Date</th>\n                                <th md-column ng-repeat="dataset in data track by $index">{{::dataset.key}}</th>\n                            </tr>\n                        </thead>\n                        <tbody md-body>\n                            <tr md-row ng-repeat="firstDataSet in data[0].values track by $index" ng-init="i = $index">\n                                <td md-cell>{{::firstDataSet.date * 1000 | date}}</td>\n                                <td md-cell ng-repeat="dataSet in data track by $index">{{::dataSet.values[i].value | currency}}</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </md-table-container>\n\n            </md-content>\n        </md-tab>\n\n    </md-tabs>\n</div>');
$templateCache.put('core/reports/savings_goal/savings_goal.html','<div flex>\n    <savings-goal report-data="::reportData()"></savings-goal>\n</div>');
$templateCache.put('core/reports/savings_goal/savingsGoalDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/reports/taxes_paid/taxes_paid.html','<div flex>\n    <taxes-paid report-data="reportData()"></taxes-paid>\n</div>');
$templateCache.put('core/reports/taxes_paid/taxes_paidDirective.html','<div flex>\n    <nvd3 options="options" data="data" ng-if="data"></nvd3>\n    <div layout="row" layout-sm="column" layout-align="space-around" ng-hide="data">\n        <md-progress-circular md-mode="indeterminate"></md-progress-circular>\n    </div>\n</div>');
$templateCache.put('core/sidemenu.html','\n<md-toolbar class="md-theme-indigo">\n    <h1 class="md-toolbar-tools">Reports</h1>\n</md-toolbar>\n<md-content layout="column" flex>\n    <div layout="column" flex>\n        <md-button class="md-raised" md-no-ink ui-sref="main" ui-sref-active="md-primary">\n            <ng-md-icon icon="home" style="fill: gray"></ng-md-icon>\n            Home\n        </md-button>\n        <md-button class="md-raised" md-no-ink ng-repeat="report in controller.reports" ui-sref="report({report: report.file})" ui-sref-active="md-primary">\n            {{report.name}}\n        </md-button>\n    </div>\n</md-content>\n');}]);