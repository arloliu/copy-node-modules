#!/usr/bin/env node
var path = require('path');
var copyNodeModules = require('../');
var args = process.argv.slice(2);

if (args.length < 2)
{
    console.error('Usage: copy-node-module src_dir dest_dir [--dev] [-v|--verbose] ');
    process.exit(1);
}

var srcDir = args[0].trim(),
    dstDir = args[1].trim(),
    devDeps = false,
    verbose = false;

// parse input arguments
if (args.indexOf('--dev') !== -1)
    devDeps = true;
if (args.indexOf('-v') !== -1 || args.indexOf('--verbose') !== -1)
    verbose = true;

if (!path.isAbsolute(srcDir))
    srcDir = path.resolve(process.cwd(), srcDir);
if (!path.isAbsolute(srcDir))
    dstDir = path.resolve(process.cwd(), dstDir);


var options = {devDependencies: devDeps};
copyNodeModules(srcDir, dstDir, options, function(err, packages) {
    if (err)
    {
        console.error('Error:' + err);
        process.exit(1);
    }
    if (verbose)
    {
        console.log('Module List:');
        for (var i in packages)
            console.log(' * ' + packages[i].name);
        console.log('Total: ' + packages.length + ' modules.');
    }
});
