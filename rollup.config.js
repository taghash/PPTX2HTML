import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'

export default {
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: [
        'syntax-async-functions',
        'transform-async-to-generator',
        'transform-runtime'
      ],
      presets: ['es2015-rollup'],
      runtimeHelpers: true
    }),
    nodeGlobals(),
    builtins(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: true
    })
  ]
}
