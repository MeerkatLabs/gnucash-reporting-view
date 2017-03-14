/**
 * Add all of the watches.
 */
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    path = require('path'),
    watch = require('gulp-watch'),
    config = require('../config');

var CHANGED_EVENT = 'change',
    ADD_EVENT = 'add',
    DELETE_EVENT = 'unlink';

gulp.task('watch', ['default'], defineWatches);

/**
 * Define all of the watches.
 */
function defineWatches() {

    watch(config.sources.js.all, runTasks(['build'], ['build']));
    watch(config.sources.html.all, runTasks(['build'], ['build']));

    watch(config.sources.css.all, runTasks(['sass'], ['sass']));

    watch(config.sources.js.testAll, runTasks(['build_test'], ['build_test']));
    watch(config.sources.html.testAll, runTasks(['build_test'], ['build_test']));

    watch(config.paths.destination + '/**/*', runTasks(['inject'], ['inject']));

}

/**
 * Run the tasks provided when the file stream changes.
 * @param changeTasks {[string]} tasks to run when the files change.
 * @param [addRemoveTasks] {[string]} task to run when the files are added or removed.
 * @returns {Function}
 */
function runTasks(changeTasks, addRemoveTasks) {

    return function(vinyl) {

        watchDebugStatement(vinyl.path, vinyl.event);

        switch(vinyl.event) {
            case ADD_EVENT:
            case DELETE_EVENT:
                if (addRemoveTasks && addRemoveTasks.length) {
                    gulp.start(addRemoveTasks);
                }
                break;
            case CHANGED_EVENT:
                gulp.start(changeTasks);
                break;
        }

    };

}

/**
 * Debug statement helper
 * @param file
 * @param type
 */
function watchDebugStatement(file, type) {

    var eventString = '';
    switch (type) {
        case CHANGED_EVENT:
            eventString = gutil.colors.bold.blue('Changed');
            break;
        case DELETE_EVENT:
            eventString = gutil.colors.bold.red('Deleted');
            break;

        case ADD_EVENT:
            eventString = gutil.colors.bold.green('Added');
            break;

        default:
            eventString = gutil.colors.bold.gray(type);
    }

    var filePath = path.relative('', file);
    gutil.log(eventString, gutil.colors.cyan('\'' + filePath + '\''));
}