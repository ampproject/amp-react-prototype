import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external'
import replace from '@rollup/plugin-replace';

export default {
  input: 'export.sparse.js',
  output: {
    sourceMap: true,

    // file: 'qqqqq.js',
    // format: 'iife',

    dir: 'qqqqq',
    format: 'es',
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": '"development"',
    }),
    // external({
    //   includeDependencies: true,
    // }),
    babel({
      babelHelpers: 'bundled',
      // babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    resolve(),
    commonjs(),
  ],
};
