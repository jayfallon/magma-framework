var gulp              = require('gulp'),
	postcss							= require('gulp-postcss'),
	cssNano							= require('cssnano'),
	minifyCSS           = require('gulp-minify-css'),
	less                = require('gulp-less'),
	stylus              = require('gulp-stylus'),
	minimist            = require('minimist'),
	concat              = require('gulp-concat'),
	CombinedStream      = require('combined-stream'),
	harp                = require('harp'),
	del                 = require('del'),
	rename              = require('gulp-rename');


gulp.task('default', function(){
	console.log("Available commands:");
	console.log("(for each command except clean, specify <command>:magma)")
	console.log("gulp build:magma - build magma, optionally with a skin, in /build");
	console.log("gulp build:magma-buttons - build magma buttons, in /build/components");
	console.log("gulp serve:magma - serve the magma documentation locally");
	console.log("gulp compile:magma - compile the magma documentation, in /static");
	console.log("gulp clean - delete any built/compiled assets");
});

gulp.task('build:magma-buttons', function() {
  return gulp.src('./bases/components/magma-buttons.less')
  	.pipe(less())
    .pipe(gulp.dest('./build/components/'))
    .pipe(postcss([
      cssNano()
    ]))
    .pipe(rename('magma-buttons.min.css'))
    .pipe(gulp.dest('./build/components/'));
});

gulp.task('build:magma', function(){

	var skin = minimist(process.argv).skin;

	var baseStyle = gulp.src('./bases/magma.less')
		.pipe(less());
	var skinStyle = gulp.src('./public/assets/stylesheets/' + skin + '.styl')
		.pipe(stylus());

	var combined = CombinedStream.create().append(baseStyle).append(skinStyle);

	return combined.pipe(concat('magma' + (skin == undefined? '' : '-' + skin) + '.css'))
		.pipe(minifyCSS())
		.pipe(rename('magma.min.css'))
		.pipe(gulp.dest('./build'));
});

gulp.task('serve:magma', ['updateHarpAssets:magma'], function(callback){

	var port = minimist(process.argv).port || 9000;

	harp.server('./public', {port: port}, callback);
	console.log('Serving at http://localhost:' + port + ', press ctrl-C to stop');

});

gulp.task('compile:magma', ['updateHarpAssets:magma'], function(callback){

	harp.compile('./public', '../static', callback);

});

gulp.task('updateHarpAssets:magma', function(){

	var bsStyle = gulp.src('./bases/magma.less')
		.pipe(less())
		.pipe(rename('styles.css'))
		.pipe(gulp.dest('./public/assets/generated'));

	var javaScripts = gulp.src(['./bower_components/bootstrap/dist/js/bootstrap.js',
			'./bower_components/jquery/dist/jquery.js'])
		.pipe(gulp.dest('./public/assets/generated'));

	return CombinedStream.create().append(bsStyle).append(javaScripts);

});

gulp.task('clean', function(callback){
	del([
		'./build',
		'./public/assets/generated'
	], callback());
});
