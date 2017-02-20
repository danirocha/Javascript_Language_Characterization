var fs = require('fs'),
    exec = require('child_process').exec,
    baseDirectory = "C:\\Users\\Danish Bloom\\Desktop\\dist",
    directoriresToRemove = ['.git', 'node_modules', 'bower_components'],
    directoriesTree = {};

function collectSubDirs(path, parentElem, packageElem) {
    fs.readdir(path + "\\" + packageElem, function(err, list) {
        if (err) throw(err);
        else {
            directoriesTree[parentElem][packageElem] =  list;
            console.log(directoriesTree);
        }
    });
}

function collectPackagesDirectories(elem, index) {
    var parentDirectory = baseDirectory + "\\" + elem;
    fs.readdir(parentDirectory, function(err, list) {
        if (err) throw(err);
        else {
            directoriesTree[elem] = {};
            for(key in list)
                collectSubDirs(parentDirectory, elem, list[key]);
        }
    });
}

function readRootDirectory() {
    fs.readdir(baseDirectory, function(err, list) {
        if (err) throw(err);
        list.forEach(collectPackagesDirectories);
    });
}

function init() {
    var cmd = "cd " + baseDirectory;
    exec(cmd, readRootDirectory);
}

readRootDirectory();
