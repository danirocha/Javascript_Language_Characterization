var fs = require('fs'),
    path = require('path'),

    // baseDirectory = "C:\\Users\\IBM_ADMIN\\Documents\\Projetos\\test_project",
    baseDirectory = "C:\\Users\\Danish Bloom\\Desktop\\dist",
    allLibraries = {};

// read all subdirectories recursively
function readDirectories(currentDir, libName) {
    fs.readdir(currentDir, function(err, list) {
        if (err)
            throw err;

        allElems = list.map(function(elem) {
            return path.join(currentDir, elem);
        });

        allElems.filter(function (elemPath) {
            return fs.statSync(elemPath).isFile();
        }).forEach(function(filePath) {
            var obj = {
              path: path.dirname(filePath),
              name: path.basename(filePath).split(".")[0],
              ext: path.extname(filePath),
              sizeInBytes: fs.statSync(filePath).size
            };

            allLibraries[libName].push(obj);
            // console.log(obj);
        });

        allElems.filter(function (elemPath) {
            return fs.statSync(elemPath).isDirectory();
        }).forEach(function(dirPath) {
            readDirectories(dirPath, libName);
        });
    });
}

// read all basedirectories and extract libs names
function readBaseDirectories(baseDirectory) {
    fs.readdir(baseDirectory, function(err, list) {
        if (err)
            throw err;

        list.map(function(dir) {
            return path.join(baseDirectory, dir);
        }).forEach(function(dirPath) {
            fs.readdir(dirPath, function(err, list) {
                if (err)
                    throw err;

                list.map(function(dir) {
                    allLibraries[dir] = [];
                    return {
                              path: path.join(dirPath, dir),
                              libName: dir
                          };
                }).forEach(function(dirObj) {
                    readDirectories(dirObj.path, dirObj.libName);
                });
            });
        });
    });
}

readBaseDirectories(baseDirectory);
