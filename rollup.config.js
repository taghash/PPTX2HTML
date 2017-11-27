import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'

export default {
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: true
    }),
    babel({
      presets: [
        ['@babel/env', {useBuiltins: 'usage', modules: false}]
      ]
    }),
    nodeGlobals(),
    builtins()
  ]
}
