const gulp = require('gulp');
// buble相对babel没有插件机制的好处就是更快且配置更简单
const buble = require('rollup-plugin-buble');
const buildJs = require('./build-js.js');
const buildLess = require('./build-less.js');


gulp.task('js', (cb) => {
  buildJs(cb);
});

gulp.task('less', (cb) => {
  buildLess(cb);
});

gulp.task('build', ['js', 'less']);