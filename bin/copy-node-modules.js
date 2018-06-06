#!/usr/bin/env node
var path = require('path');
var yargs = require('yargs');
var copyNodeModules = require('../');

yargs
    .wrap(null)
    .usage('Usage: $0 <command> [options]')
    .strict(true)
    .command('$0 <srcDir> <dstDir>', 'Copy node modules', yargs => {
        return yargs
            .option('dev', {
                describe: 'Include dev dependencies',
                type: 'boolean'
            })
            .option('concurrency', {
                describe: 'Root packages\' copying concurrency',
                type: 'number'
            })
            .option('verbose', {
                describe: 'Verbose output',
                type: 'boolean'
            })
            .default('dev', false)
            .default('verbose', false)
    }, args => {
        var srcDir = args.srcDir,
            dstDir = args.dstDir;

        if (!path.isAbsolute(srcDir))
            srcDir = path.resolve(process.cwd(), srcDir);
        if (!path.isAbsolute(srcDir))
            dstDir = path.resolve(process.cwd(), dstDir);

        var options = { devDependencies: args.dev };
        if (args.concurrency) {
            options.concurrency = args.concurrency;
        }

        copyNodeModules(srcDir, dstDir, options, function(err, packages) {
            if (err) {
                console.error('Error: ' + err);
                process.exit(1);
            }

            if (args.verbose) {
                console.log('Module List:');
                for (var i in packages) {
                    console.log(' * ' + packages[i].name);
                }
                console.log('Total: ' + packages.length + ' modules.');
            }
        });
    })
    .help()
    .version()
    .parse();
