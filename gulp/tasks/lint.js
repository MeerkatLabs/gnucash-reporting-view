/**
 * Execute lint tools on the source code.
 */
var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    config = require('../config');

gulp.task('lint', lint);

function lint() {
    return gulp.src(config.sources.js.all)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(jshint.reporter('fail'));
}