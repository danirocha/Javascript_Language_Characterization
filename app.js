var exec = require('child_process').exec;
var Finder = require('fs-finder');
var pckg, fileSrc, fileMinified, argsLength = process.argv.length, count = 2;

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

      fileMinified = pckg+'.min.js';
      findFile();
    }
  }
  exec(cmd, callback);
}

// Find package.min.js file's path
function findFile() {
  var files = Finder.from('./node_modules').findFiles('<'+fileMinified+'$>', function(paths) {
    fileSrc = paths;
    console.log("path to extract: \n     "+fileSrc+'\n');
    extractFile();
  });
}

// Moves wanted .min.js file to a ./src directory
function extractFile() {
  var cmd = 'move '+fileSrc+' .\\src';

  function callback(error, stdout, stderr) {
    if(stdout){
      console.log('file extracted to source directory.\n     '+fileMinified+' -> .\\src\\\n');
      uninstallPackage();
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
