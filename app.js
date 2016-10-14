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
      console.log('package '+pckg+' installed!');

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
    console.log("path to extract: "+fileSrc);
    extractFile();
  });
}

// Moves wanted .min.js file to a ./src directory
function extractFile() {
  var cmd = 'move '+fileSrc+' .\\src';

  function callback(error, stdout, stderr) {
    if(stdout){
      console.log(fileMinified+' file extracted to .\\src');
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
      console.log('package '+pckg+' uninstalled!');

    count++;
    getPackageToInstall();
  }
  exec(cmd, callback);
}

// init
getPackageToInstall();
