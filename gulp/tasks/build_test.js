/**
 * Builds all of the javascript that is located in the source directory.
 */

var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    order = require('gulp-order'),
    config = require('../config');

gulp.task('build_test', ['templates_test'], buildTestProduct);

function buildTestProduct() {

    var sourceFiles = config.sources.js.testAll.slice(0);
    sourceFiles.push(path.join(config.paths.temp, config.sources.js.templatesTest));

    return gulp.src(sourceFiles)
        .pipe(order(config.ordering.js, {base: ''}))
        .pipe(concat(config.products.js.testApp))
        .pipe(gulp.dest(config.paths.destination));
}