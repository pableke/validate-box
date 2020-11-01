
//npm install -D gulp gulp-concat gulp-minify gulp-clean-css
const gulp = require("gulp");
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const css = require("gulp-clean-css");

const STYLES = [ "src/css/style.css" ];
const JS_FILES = [
	"src/js/data-box.js", "src/js/date-box.js", "src/js/message-box.js", "src/js/number-box.js", 
	"src/js/string-box.js", "src/js/validate-box.js", "src/js/util.js"
];

gulp.task("pack-css", () => {    
	return gulp.src("src/css/style.css")
				.pipe(concat("style.min.css"))
				.pipe(css())
				.pipe(gulp.dest("src/css"));
});

gulp.task("pack-js", () => {
	return gulp.src(JS_FILES)
				.pipe(concat("multi-box.js"))
				.pipe(minify({ ext: { min: ".min.js" }, ignoreFiles: [".min.js"]}))
				.pipe(gulp.dest("src/js"));
});

gulp.task("watch", () => {
	gulp.watch(STYLES, gulp.series("pack-css")); 
	gulp.watch(JS_FILES, gulp.series("pack-js")); 
	// Other watchers ...
});

gulp.task("default", gulp.parallel("pack-css", "pack-js", "watch"));
