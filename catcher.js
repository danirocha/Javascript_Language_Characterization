var exec = require('child_process').exec;
var Finder = require('fs-finder');
var pckg, fileSrc, fileJS, argsArray, argsLength, count = 0;

// Get cmd arguments array to extract package name(s)
function getPackagesToInstall() {
  argsArray = process.argv.splice(2);

  if(argsArray.length === 0)
    console.log("You must specify a package to install!");
  else
    argsLength = argsArray.length;

  getNextPackage();
}

// Check if there's a next package to install
function getNextPackage() {
  if(count < argsLength) {
    pckg = argsArray[count];
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

// Move wanted .js file to a ./src directory
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
    getNextPackage();
  }
  exec(cmd, callback);
}

// init
getPackagesToInstall();
