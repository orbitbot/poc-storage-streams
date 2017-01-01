import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs    from 'rollup-plugin-commonjs';
import buble       from 'rollup-plugin-buble';
import filesize    from 'rollup-plugin-filesize';

module.exports = {
  entry      : 'index.js',
  dest       : 'storage.js',
  format     : 'umd',
  moduleId   : 'Storage',
  moduleName : 'Storage',
  plugins    : [
    nodeResolve({ jsnext: true, main: true, browser: true }),
    commonjs(),
    buble(),
    filesize()
  ]
};
