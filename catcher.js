var exec = require('child_process').exec;
var Finder = require('fs-finder');
var pckg, fileSrc, fileJS, argsLength = process.argv.length, count = 2;

// get cmd arguments array to extract package name(s)
function getPackageToInstall() {
  if(count < argsLength) {
    pckg = process.argv[count];
    installPackage();
  }
}

// Install specified package by npm
function installPackage() {
  var cmd = 'npm install '+pckg;

  function callback(error, stdout, stderr) {
    if(stdout) {
      console.log('--- process starded...\npackage '+pckg+' installed.\n');

      fileJS = pckg+'.js';
      findFile();
    }
  }
  exec(cmd, callback);
}

// Find package.js file's path
function findFile() {
  var files = Finder.from('./node_modules').findFiles('<'+fileJS+'$>', function(paths) {
    fileSrc = paths[0];
    console.log("path to extract: \n     "+fileSrc+'\n');
    extractFile();
  });
}

// Moves wanted .js file to a ./src directory
function extractFile() {
  var cmd = 'move '+fileSrc+' .\\src';

  function callback(error, stdout, stderr) {
    console.log(stderr);
    if(stdout){
      console.log('file extracted to source directory.\n     '+fileJS+' -> .\\src\\\n');
      uninstallPackage();
    }
    else {
      console.log("hein?");
    }
  }
  exec(cmd, callback);
}

// Uninstall specified package by npm
function uninstallPackage() {
  var cmd = 'npm uninstall '+pckg;

  function callback(error, stdout, stderr) {
    if(stdout)
      console.log('package '+pckg+' uninstalled.\n--- process completed!\n--------------------------------------');

    count++;
    getPackageToInstall();
  }
  exec(cmd, callback);
}

// init
getPackageToInstall();
