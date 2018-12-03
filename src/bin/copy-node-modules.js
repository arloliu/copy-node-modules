#!/usr/bin/env node
import path from 'path';
import yargs from 'yargs';
import copyNodeModules from '..';

const cliOpts = yargs => yargs
  .option('v', {
    describe: 'Verbose output',
    type: 'boolean',
  })
  .option('d', {
    describe: 'Include dev dependencies',
    type: 'boolean',
  })
  .option('c', {
    describe: 'Root packages\' copying concurrency',
    type: 'number',
  })
  .option('f', {
    describe: 'Regular Expression, on match copy',
    type: 'string',
  })
  .default('v', false)
  .default('d', false)
  .alias('v', 'verbose')
  .alias('d', 'dev')
  .alias('c', 'concurrency')
  .alias('f', 'filter');

yargs
  .wrap(null)
  .usage('Usage: $0 <command> [options]')
  .strict(true)
  .command('$0 <srcDir> <dstDir>', 'Copy node modules', yargs => cliOpts(yargs), (args) => {
    let { srcDir, dstDir } = args;
    if (!path.isAbsolute(srcDir)) {
      srcDir = path.resolve(process.cwd(), srcDir);
    }
    if (!path.isAbsolute(dstDir)) {
      dstDir = path.resolve(process.cwd(), dstDir);
    }

    const { concurrency, filter } = args;
    const options = { devDependencies: args.dev };
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

    copyNodeModules(srcDir, dstDir, options, (err, packages) => {
      if (err) {
        console.error(`Error: ${err}`); // eslint-disable-line no-console
        process.exit(1);
      }

      if (args.verbose) {
        console.log('Module List:'); // eslint-disable-line no-console
        packages.forEach(pkg => console.log(` * ${pkg.name}`)); // eslint-disable-line no-console
        console.log(`Total: ${packages.length} modules.`); // eslint-disable-line no-console
      }
    });
  })
  .help()
  .version('version')
  .parse();
