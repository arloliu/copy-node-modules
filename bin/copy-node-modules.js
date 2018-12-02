#!/usr/bin/env node
"use strict";

var _path = _interopRequireDefault(require("path"));

var _yargs = _interopRequireDefault(require("yargs"));

var _ = _interopRequireDefault(require(".."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cliOpts = function cliOpts(yargs) {
  return yargs.option('v', {
    describe: 'Verbose output',
    type: 'boolean'
  }).option('d', {
    describe: 'Include dev dependencies',
    type: 'boolean'
  }).option('c', {
    describe: 'Root packages\' copying concurrency',
    type: 'number'
  }).option('f', {
    describe: 'Regular Expression, on match copy',
    type: 'string'
  }).default('v', false).default('d', false).alias('v', 'verbose').alias('d', 'dev').alias('c', 'concurrency').alias('f', 'filter');
};

_yargs.default.wrap(null).usage('Usage: $0 <command> [options]').strict(true).command('$0 <srcDir> <dstDir>', 'Copy node modules', function (yargs) {
  return cliOpts(yargs);
}, function (args) {
  var srcDir = args.srcDir,
      dstDir = args.dstDir;

  if (!_path.default.isAbsolute(srcDir)) {
    srcDir = _path.default.resolve(process.cwd(), srcDir);
  }

  if (!_path.default.isAbsolute(dstDir)) {
    dstDir = _path.default.resolve(process.cwd(), dstDir);
  }

  var dev = args.dev,
      concurrency = args.concurrency,
      filter = args.filter;
  var options = {
    devDependencies: dev
  };

  if (concurrency) {
    options.concurrency = concurrency;
  }

  if (filter) {
    try {
      options.filter = new RegExp(filter, 'g');
    } catch (ex) {
      console.error(ex.message); // eslint-disable-line no-console

      process.exit(1);
    }
  }

  (0, _.default)(srcDir, dstDir, options, function (err, pkgs) {
    if (err) {
      console.error("Error: ".concat(err)); // eslint-disable-line no-console

      process.exit(1);
    }

    if (args.verbose) {
      console.log('Module List:'); // eslint-disable-line no-console

      pkgs.forEach(function (pkg) {
        return console.log(" * ".concat(pkg.name));
      }); // eslint-disable-line no-console

      console.log("Total: ".concat(pkgs.length, " modules.")); // eslint-disable-line no-console
    }
  });
}).help().version('version').parse();