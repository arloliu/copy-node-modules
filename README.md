#copy-node-modules - fast deploy Node.js modules to distination folder
Copy all modules listed in 'dependencies' or 'devDependencies' field of package.json to destination folder. 

The procedure:

1. Read package.json from source directoy, and read 'dependencies' or 'devDependencies' field.
2. Search existed modules in source directory, and search all dependencies.
3. Copy all modules to destination directory.

The modern applications use lots of modules, each module depends on more modules, results hundreds of modules need to be installed when typing `npm install`. When you want to pack/deploy your application to a folder which contains all needed modules, this module will help you to save time from slow `npm install`

It will save you a bunch of time to deploy stand-alone application from existed development directory, no need to fetch all modules from remote repository.

## Installation
    npm install copy-node-modules --save-dev

## Programmatic Usage
```javascript
var copyNodeModule = require('copy-node-modules');
```
#### copyNodeModules(srcDir, dstDir, [options], callback)
* `srcDir`: source directory contains package.json file.
* `dstDir`: destination directory to copy modules, the modules will copy to `dstDir/node_modules` directory.
* `options`:
  `devDependencies`: Boolean value, defaults to **false**, also copy development modules when it sets to **true**
* `callback(err, results)`: A callback which is called when all copy tasks have finished or error occurs, `results` is an array contains copied modules, each item is an object as `{name: 'xxx', version: 'xxx'}`

## Examples
```javascript
var copyNodeModule = require('copy-node-modules');
var srcDir = '/somewhere/project';
var dstDir = '/somewhere/project/dist';
copyNodeModule(srcDir, dstDir, {devDependencies: false}, function(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  for (var i in results) {
    console.log('package name:' + results[i].name + ' version:' + results[i].version);
  }
});
```

## CLI Usage
    Usage: Usage: copy-node-module src_dir dest_dir [--dev] [-v|--verbose]
* `src_dir`: source directory contains package.json file.
* `dstDir`: destination directory to copy modules, the modules will copy to `dstDir/node_modules` directory.
* `--dev`: also copy modules listed in `devDependencies` field.
* `-v|--verbose`: verbose mode.

## License
MIT
