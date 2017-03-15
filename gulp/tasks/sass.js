/**
 * Compile all of the sass files into a css file for inclusion.
 */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    config = require('../config');

gulp.task('sass', buildSassProduct);

function buildSassProduct() {
    return gulp.src(config.sources.css.all)
        .pipe(sass({
            includePaths: config.sources.css.includes
        }).on('error', sass.logError))
        .pipe(gulp.dest(config.paths.destination));
}