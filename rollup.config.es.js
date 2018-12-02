import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'CopyNodeModules',
    file: 'lib/index.es.js',
    format: 'es',
  },
  external: [
    'async',
    'graceful-fs',
    'jsonfile',
    'lodash.flatten',
    'lodash.uniqwith',
    'mkdirp',
    'ncp',
    'path',
    'semver',
    'yargs',
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
