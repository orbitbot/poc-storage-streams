import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs    from 'rollup-plugin-commonjs';
import buble       from 'rollup-plugin-buble';
import filesize    from 'rollup-plugin-filesize';

module.exports = {
  entry      : 'proxy.js',
  dest       : 'proxyStorage.js',
  format     : 'umd',
  moduleId   : 'ProxyStorage',
  moduleName : 'ProxyStorage',
  plugins    : [
    nodeResolve({ jsnext: true, main: true, browser: true }),
    commonjs(),
    buble(),
    filesize()
  ]
};
