/**
 * Configuration file that will define all of the paths for this project.
 */
var package_json = require('../package.json'),
    path = require('path'),
    env = process.env.NODE_ENV;

module.exports = {
    environment: {
        // Make the workflow production by default and development if overridden.
        production: env !== 'development'
    },
    paths: {
        project: './',
        destination: path.dirname(package_json.main),
        temp: 'temp'
    },
    sources: {
        css: {
            all: 'sass/**/*.scss',
            includes: [
            ],
            vendor: [
                './node_modules/angular-material/angular-material.min.css',
                './node_modules/angular-material-data-table/dist/md-data-table.css',
                './node_modules/nvd3/build/nv.d3.min.css'
            ]
        },
        js: {
            all: [
                'src/**/*.js'
            ],
            testAll: [
                'test/**/*.js'
            ],
            templates: 'templates.js',
            templatesTest: 'templatesTest.js',
            vendor: [
                './node_modules/angular/angular.min.js',
                './node_modules/angular-aria/angular-aria.min.js',
                './node_modules/angular-animate/angular-animate.min.js',
                './node_modules/angular-material/angular-material.min.js',
                './node_modules/angular-ui-router/release/angular-ui-router.min.js',
                './node_modules/d3/d3.js',
                './node_modules/nvd3/build/nv.d3.min.js',
                './node_modules/angular-nvd3/dist/angular-nvd3.min.js',
                './node_modules/angular-material-data-table/dist/md-data-table.min.js',
                './node_modules/angular-material-icons/angular-material-icons.min.js'
            ]
        },
        html: {
            all: [
                'src/**/*.html'
            ],
            testAll: [
                'test/**/*.html'
            ]
        }
    },
    ordering: {
        // The ordering of the javascript files for both building and injection into index.html
        js: [
            'src/**/*.module.js',
            'src/**/_*.js',
            'src/**/*.js',
            'test/**/*.module.js',
            'test/**/_*.js',
            'test/**/*.js',
            'temp/**/*.js'
        ],
        html: [
            '**/*.html'
        ]
    },
    products: {
        js: {
            app: path.basename(package_json.main),
            testApp: 'testApp.js'
        },
        html: {
            index: 'index.html'
        }
    },
    names: {
        angular: {
            moduleName: 'gnucash-reports-view',
            testModuleName: 'gnucash-reports-view.test'
        }
    }
};
