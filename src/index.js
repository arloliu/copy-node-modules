import path from 'path';
import fs from 'graceful-fs';
import mkdirp from 'mkdirp';
import jsonfile from 'jsonfile';
import semver from 'semver';
import async from 'async';
import ncp from 'ncp';
import uniqWith from 'lodash.uniqwith';
import flatten from 'lodash.flatten';

let gOpts = {};

function dirExists(directory) {
  try {
    return fs.lstatSync(directory).isDirectory();
  } catch (e) {
    return false;
  }
}

function getPackageJson(pkgDir) {
  const pkgPath = path.resolve(pkgDir, 'package.json');
  try {
    return jsonfile.readFileSync(pkgPath, { throws: false });
  } catch (e) {
    // skip missing modules
    return null;
  }
}

function hasPackage(pkg, pkgs) {
  const { name, version } = pkg;
  for (let i = 0; i < pkgs.length; i += 1) {
    if (pkgs[i].name === name && pkgs[i].version === version) {
      return true;
    }
  }
  return false;
}

function addPkgDeps(baseDir, pkg, pkgs, callback) {
  const pkgDir = path.resolve(baseDir, `node_modules/${pkg.name}`);
  const pkgContent = getPackageJson(pkgDir);
  if (!pkgContent) {
    return;
  }

  if (hasPackage(pkgContent, pkgs)) {
    return;
  }

  if (baseDir === gOpts.srcDir) {
    const { name, version } = pkgContent;
    if (!semver.validRange(pkg.version) || semver.satisfies(pkgContent.version, pkg.version)) {
      pkgs.push({ name, version });
    }
  }

  // recursive search sub modules
  const subPkgBase = path.resolve(pkgDir, 'node_modules');
  if (dirExists(subPkgBase)) {
    const subPkgs = fs.readdirSync(subPkgBase);
    subPkgs.forEach(name => addPkgDeps(pkgDir, { name, version: '*' }, pkgs, callback));
  }

  Object.keys(pkgContent.dependencies).forEach((name) => {
    const version = pkgContent.dependencies[name];
    if (!version.startsWith('file:')) {
      const depPkg = { name, version };
      addPkgDeps(gOpts.srcDir, depPkg, pkgs, callback);
      addPkgDeps(pkgDir, depPkg, pkgs, callback);
    }
  });
}

function findPkgDeps(pkg, callback) {
  const pkgs = [];
  addPkgDeps(gOpts.srcDir, pkg, pkgs, callback);
  callback(null, pkgs);
}

function copyModules(pkgContent, callback) {
  const name = { pkgContent };
  const srcDir = path.resolve(gOpts.srcDir, `node_modules/${name}`);
  const dstDir = path.resolve(gOpts.dstDir, `node_modules/${name}`);
  const { filter } = gOpts;
  mkdirp.sync(dstDir);
  const opts = { clobber: false, dereference: true, filter };
  ncp(srcDir, dstDir, opts, err => callback(err));
}

/**
 * @param {String} srcDir
 * @param {String} dstDir
 * @param {Object} [opts]
 * @param {Boolean} [opts.devDependencies=false]
 * @param {Number} [opts.concurrency]
 * @param {string} [opts.filter]
 * @param {Function} callback
 */
function copyNodeModules(srcDir, dstDir, opts, callback) {
  if (!srcDir) {
    throw new TypeError('Missing source directory argument.');
  }

  if (!dstDir) {
    throw new TypeError('Missing destination diretory argument.');
  }

  if (!callback) {
    gOpts = { srcDir, dstDir, devDependencies: false };
    callback = opts;
  } else {
    gOpts = opts || {};
    gOpts.srcDir = gOpts.srcDir || srcDir;
    gOpts.dstDir = dstDir;
  }

  const pkgPath = path.resolve(srcDir, './package.json');
  const pkgContent = jsonfile.readFileSync(pkgPath, { throws: false });
  if (!pkgContent) {
    throw new Error('Parsing package.json in source directory fail.');
  }

  // prepare root package list
  let version;
  const rootPkgList = [];
  Object.keys(pkgContent.dependencies).forEach((name) => {
    version = pkgContent.dependencies[name];
    if (!version.startsWith('file:')) {
      rootPkgList.push({ name, version });
    }
  });

  if (gOpts.devDependencies) {
    Object.keys(pkgContent.devDependencies).forEach((name) => {
      version = pkgContent.devDependencies[name];
      if (!version.startsWith('file:')) {
        rootPkgList.push({ name, version });
      }
    });
  }

  async.map(rootPkgList, findPkgDeps, (err, results) => {
    if (err) {
      callback(err);
      return;
    }

    const dstModuleDir = path.resolve(gOpts.dstDir, './node_modules');
    fs.stat(dstModuleDir, (err, stat) => {
      if (err || !stat.isDirectory()) {
        if (!mkdirp.sync(dstModuleDir)) {
          callback('Can not create destination node_modules directory');
          return;
        }
      }

      const allPkgList = uniqWith(flatten(results), (a, b) => a.name === b.name && a.version === b.version);

      if (gOpts.concurrency) {
        const queue = async.queue(copyModules, gOpts.concurrency);
        queue.drain = () => callback(null, allPkgList);
        queue.push(allPkgList, (err) => {
          if (err) {
            queue.kill();
            callback(err, allPkgList);
          }
        });
      } else {
        async.each(allPkgList, copyModules, err => callback(err, allPkgList));
      }
    });
  });
}

export default copyNodeModules;
