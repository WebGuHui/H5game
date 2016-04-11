var gulp = require('gulp');
// var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
// var obfuscate = require('gulp-obfuscate');
// var minifyhtml = require('gulp-minify-html');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('browser-sync',function(){
	browserSync.init({
		server:'./'
	})
});

// gulp.task('uglify',function(){
// 	return gulp.src('./js-minify/*.js')
// 			   .pipe(uglify())
// 			   .pipe(gulp.dest('./js/'));
// });

gulp.task('minifycss',function(){
	return gulp.src('./*.scss')
			   .pipe(sass({sourcemap:true}).on('error',sass.logError))
			   .pipe(cssnano())
			   .pipe(gulp.dest('./dist/'))
			   .pipe(reload({stream: true}));
});

gulp.task('watch',function(){
	gulp.watch('./*.scss',['minifycss']);
	gulp.watch('./*.html',['reload']);
});

gulp.task('reload',function(){
	reload({stream:true});
});

// gulp.task('minifyhtml',function(){
// 	return gulp.src('./*.html')
// 			   .pipe(minifyhtml())
// 			   .pipe(gulp.dest('./cssdist/'));
// });

gulp.task('default',['minifycss','browser-sync','watch']);