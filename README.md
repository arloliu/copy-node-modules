# copy-node-modules - fast Node.js modules deployment to destination directory

Copy all modules listed in `dependencies` or/and `devDependencies` field of `package.json` to destination directory. 

The procedure:

1. Read `package.json` from source directory and read `dependencies` or `devDependencies` field.
2. Search for existing modules and ther dependencies in source directory.
3. Copy all modules to destination directory.

Modern applications use lots of modules, each module depends on more modules resulting in hundreds of modules being installed when typing `npm install`. This module will help you to save time from slow `npm install` when you want to pack/deploy your application to a directory which contains all needed modules. 

It will save you a bunch of time to deploy a stand-alone application from existing development directory, no need to fetch all modules from remote repository.

## Installation

```
npm install copy-node-modules --save-dev
```

## Programmatic Usage

```javascript
var copyNodeModules = require('copy-node-modules');
```

#### copyNodeModules(srcDir, dstDir, [options], callback)

* `srcDir`: source directory containing `package.json` file.
* `dstDir`: destination directory to copy modules to (modules will be copied to `dstDir/node_modules` directory).
* `options`:

  - `devDependencies`: boolean value, defaults to **false**, showing whether modules in `devDependencies` field of `package.json` should also be copied (when it's set to **true**).
  - `concurrency`: integer value, max number of root packages whose files are being copied concurrently.
  - `filter`: A `RegExp` OR a `method` that accepts one value (the full path) and returns a boolean (copy on true).
  
* `callback(err, results)`: A callback which is called when all copy tasks have finished or error occurs, `results` is an array contains copied modules, each item is an object as `{name: 'xxx', version: 'xxx'}`

## Examples

```javascript
var copyNodeModule = require('copy-node-modules');
var srcDir = '/somewhere/project';
var dstDir = '/somewhere/project/dist';
copyNodeModule(srcDir, dstDir, { devDependencies: false }, function(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  for (var i in results) {
    console.log('package name: ' + results[i].name + ', version: ' + results[i].version);
  }
});
```

### Example with a filter method

```javascript
var copyNodeModule = require('copy-node-modules');
var srcDir = '/somewhere/project';
var dstDir = '/somewhere/project/dist';

// Filter method that will ignore node_module folders in a node module.
var filter = (path) => {
  let index = v.indexOf("node_modules");
  let secondIndex = v.indexOf("node_modules", index + 1);

  return (secondIndex == -1);
}

copyNodeModule(srcDir, dstDir, { devDependencies: false filter: filter}, function(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  for (var i in results) {
    console.log('package name: ' + results[i].name + ', version: ' + results[i].version);
  }
});
```

## CLI Usage

```
copy-node-modules src_dir dest_dir [-d|--dev] [-c|--concurrency] [-v|--verbose] [-f|--filter]
```

* `src_dir`: source directory containing `package.json` file.
* `dest_dir`: destination directory to copy modules to (modules will be copied to `dest_dir/node_modules` directory).
* `-d|--dev`: whether modules in `devDependencies` field of `package.json` should be also copied.
* `-c|--concurrency`: max number of root packages whose files are being copied concurrently.
* `-v|--verbose`: verbose mode.
* `-f|--filter`: A Regular Expression, files that match this expression will be copied. It also matches directories fi. `-f index.html` matches `path/index.html` but not `path/` and because of this `index.html` is not copied.

## License

MIT
