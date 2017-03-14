/**
 * Builds all of the javascript that is located in the source directory.
 */
var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    order = require('gulp-order'),
    config = require('../config');

gulp.task('build', ['lint', 'templates'], buildProduct);

function buildProduct() {

    // Need to add the template definitions to the build path as well.
    var sourceFiles = config.sources.js.all.slice(0);
    sourceFiles.push(path.join(config.paths.temp, config.sources.js.templates));

    return gulp.src(sourceFiles)
        .pipe(order(config.ordering.js, {base: ''}))
        .pipe(concat(config.products.js.app))
        .pipe(gulp.dest(config.paths.destination));
}