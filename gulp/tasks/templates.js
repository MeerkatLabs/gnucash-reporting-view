/**
 * Combine all of the html files into a template cache.
 */

var gulp = require('gulp'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    order = require('gulp-order'),
    config = require('../config');

gulp.task('templates', buildTemplateJS);

function buildTemplateJS() {
    return gulp.src(config.sources.html.all)
        .pipe(htmlmin({removeComments: true}))
        .pipe(order(config.ordering.html))
        .pipe(templateCache(config.sources.js.templates, {module: config.names.angular.moduleName}))
        .pipe(gulp.dest(config.paths.temp));
}