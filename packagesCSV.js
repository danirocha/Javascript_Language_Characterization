var fs = require('fs'),
    path = require('path'),

    baseDirectory = "C:\\Users\\Danish Bloom\\Desktop\\dist",
    allLibraries = {};

// read packages directories
function readDirectories(dirName) {
    fs.readdir(dirName, function(err, list) {
        if (err)
            throw err;

        list.map(function(dir) {
            allLibraries[dir] = {}; //init an object for each library
            return path.join(dirName, dir);
        }).forEach(function(dirPath) {
            // console.log(dirPath);
        });
    });
}

// read %1000 directories
function readBaseDirectory() {    
    fs.readdir(baseDirectory, function(err, list) {
        if (err)
            throw err;

        // console.log(list[0]);
        list.map(function(dir) {
            return path.join(baseDirectory, dir);
        }).forEach(function(dirPath) {
            readDirectories(dirPath);
        });
    });
}

function readFiles(dirName) {
    files.map(function(dir) {
        return path.join(dirName, dir);
    }).filter(function(file) {
        return file.substr(-3) === '.js';
    }).forEach(function(file) {
        fs.readFile(file, function(err, data) {

            if (err)
                throw err;
        });
      });
}

readBaseDirectory();