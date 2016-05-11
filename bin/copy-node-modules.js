#!/usr/bin/env node
var path = require('path');
var _ = require('lodash');
var copyNodeModules = require('../');
var args = process.argv.slice(2);

if (args.length < 2)
{
    console.error('Usage: copy-node-module src_dir dest_dir [--dev=bool] [-v|--verbose] ');
    process.exit(1);
}

var srcDir = args[0].trim(),
    dstDir = args[1].trim(),
    deps = true,
    devDeps = false,
    verbose = false;


function getArgumentValue(args, option)
{
    var index = _.findIndex(args, function(arg) {
        return _.startsWith(arg, option);
    });
    if (index < 0)
        return null;
    var token = args[index].split('=', 2);
    console.dir(token);
    if (token.length !== 2)
        return null;
    return token[1];
}

function parseBooleanValue(val)
{
    val = val.toLowerCase();
    if (val == 'true' || val == '1' || val == 'yes' || val == 'y')
        return true;
    return false;
}

// parse input arguments
var argValue;
argValue = getArgumentValue(args, '--dev');
if (argValue)
    devDeps = parseBooleanValue(argValue);

if (args.indexOf('-v') !== -1 || args.indexOf('--verbose') !== -1)
    verbose = true;

if (verbose)
{
    console.log('srcDir = ' + srcDir);
    console.log('dstDir = ' + dstDir);
    console.log('--dev  = ' + devDeps);
}

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