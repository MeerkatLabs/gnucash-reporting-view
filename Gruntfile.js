
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            application: {
                files: {
                    "dist/<%= pkg.name %>.js": [
                        'src/js.prefix',
                        'src/**/_*.js',
                        'src/**/*.js',
                        'src/js.suffix'
                    ]
                }
            }
        },
        uglify: {
            options: {
                banner: '/* \n' +
                '   <%= pkg.name %> <%= pkg.version %> \n' +
                '*/\n',
                compress: {
                    drop_console: true
                },
                sourceMap: true
            },
            build: {
                src: 'app/build/<%= pkg.name %>.js',
                dest: 'app/build/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            // define the files to lint
            files: ['Gruntfile.js', 'src/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'build/<%= pkg.name %>.css': 'sass/<%= pkg.name %>.scss'
                }
            }
        },
        watch: {
            scripts: {
                files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
                tasks: ['development_js']
            },
            sass: {
                files: ['Gruntfile.js', 'sass/**/*.scss'],
                tasks: ['sass']
            }

        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                background: true
            },
            //continuous integration mode: run tests once in PhantomJS browser.
            continuous: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-sass');
    //grunt.loadNpmTasks('grunt-contrib-jasmine');
    //grunt.loadNpmTasks('grunt-karma');

    // Default task(s).
    grunt.registerTask('development_js', ['jshint', 'concat']);
    grunt.registerTask('development', ['development_js']);
    grunt.registerTask('default', ['development']);

};