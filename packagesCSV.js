var fs = require('fs'),
    path = require('path'),

    baseDirectory = "C:\\Users\\Danish Bloom\\Desktop\\dist",
    allLibraries = {};

// read packages directories
function readDirectories(dirPath) {
    var obj = {};

    fs.readdir(dirPath, function(err, list) {
        if (err)
            throw err;
        // console.log(dirPath);
        list.map(function(dir) {
            if(allLibraries[dir] === undefined)
                allLibraries[dir] = { name: dir , files: []}; //init an object for each library
            obj._name = dir;
            return path.join(dirPath, dir);
        }).forEach(function(filePath) {
            obj.path = filePath;
            fs.stat(filePath, function(err, stats){
                console.log(stats);
                if(stats.isDirectory()){
                    // console.log(obj._name);

                    // for(var i in stats){
                    //     if('function' !== typeof stats[i]){
                    //         console.log(i + '\t= ' + stats[i]);
                    //     }
                    // }
                }
            });

            // console.log(obj._name);
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