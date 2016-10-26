var exec = require('child_process').exec;
var Finder = require('fs-finder');
var http = require('http');
var fs = require('fs');
var dependencies, found, pckg, fileSrc, fileJS, packsArray, arrayLength, count = 0,
    dirName = ".\\src";

// Uninstall specified package by npm
function uninstallPackage() {
    var cmd = 'npm uninstall ' + pckg;

    function callback(error, stdout, stderr) {
        if (stdout)
            console.log('package ' + pckg + ' uninstalled.\n--- process completed!\n--------------------------------------');

        count++;
        getNextPackage();
    }
    exec(cmd, callback);
}

// Move wanted .js file to a ./src directory
function extractFile() {
    var cmd = 'copy ' + fileSrc + ' .\\src';

    function callback(error, stdout, stderr) {
        if (stdout) {
            console.log('file extracted to source directory.\n     ' + fileJS + ' -> .\\src\\\n');
            if(found) {
              found = false;
              console.log('--- process completed!\n--------------------------------------');
              count++;
              getNextPackage();
            }
            else
              uninstallPackage();
        } else
            console.log(stderr);
    }
    exec(cmd, callback);
}

// Find package.js file's path
function findFile() {
    var files = Finder.from('./node_modules').findFiles('<' + fileJS + '$>', function(paths) {
        var aux = paths[0];
        fileSrc = ".\\" + aux.match(/node_modules(.*)/)[0];

        console.log("path to extract: \n     " + fileSrc + '\n');

        extractFile();
    });
}

// Install specified package by npm
function installPackage() {
    var cmd = 'npm install ' + pckg;

    function callback(error, stdout, stderr) {
        if (stdout) {
            console.log('--- process starded...\npackage ' + pckg + ' installed.\n');

            fileJS = pckg + '.js';
            findFile();
        }
    }
    exec(cmd, callback);
}

// Check if the specified package already exists before installing
function checkExistingPackage() {
    if (dependencies.hasOwnProperty(pckg)) {
        found = true;
        console.log("package " + pckg + " already installed!\n");

        fileJS = pckg + '.js';
        findFile();
    } else {
        fs.readdir(dirName, function(err, files) {
            if (err)
                throw err;

            if (files.indexOf(pckg + ".js") > -1) {
                console.log(pckg + ".js file already extracted!\n--------------------------------------");
                count++;
                getNextPackage();
            } else
                installPackage();
        });
    }
}

// Check if there's a next package to install
function getNextPackage() {
    if (count < arrayLength) {
        pckg = packsArray[count];
        checkExistingPackage();
    }
}

// Get package name(s) from 'package.txt' local file
function getPackagesToInstall() {
    fs.readFile('packages.txt', function(err, data) {
        if (err)
            throw err;

        packsArray = data.toString().split(",");
        packsArray.pop();

        if (packsArray.length === 0)
            console.log("You must specify a package to install!");
        else
            arrayLength = packsArray.length;

        getNextPackage();
    });
}

// Get program dependencies packages
function getDependencies() {
    var obj;

    fs.readFile('package.json', 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        dependencies = obj.dependencies;

        getPackagesToInstall();
    });
}

// init
getDependencies();
