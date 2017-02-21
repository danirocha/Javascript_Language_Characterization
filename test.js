var fs = require('fs'),
    Jetty = require("jetty"),
    jetty = new Jetty(process.stdout),

    baseDirectory = "C:\\Users\\Danish Bloom\\Desktop\\dist",
    directoriesToRemove = ['node_modules', 'bower_components'],
    allPackagesDirectories = [],
    directoriesTree = {};

function writeBat() {
    var batFile = '',
        auxString;

    for(i in directoriesTree)
        for(j in directoriesTree[i])
            for(key in directoriesToRemove)
                if(directoriesTree[i][j].indexOf(directoriesToRemove[key]) != -1) {
                    auxString = "RD /s " + baseDirectory + "\\" + i + "\\" + j + "\\" + directoriesToRemove[key] + "\n";
                    batFile += auxString;
                }
    batFile += "EXIT";
    fs.writeFile('removeDependencies.bat', batFile, function(err) {
        if (err) throw err;
        console.log('\nfile removeDependencies.bat written and saved!');
    });
}

function collectSubDirs(path, parentElem, packageElem) {
    fs.readdir(path + "\\" + packageElem, function(err, list) {
        if (err) throw(err);
        else {
            directoriesTree[parentElem][packageElem] =  list;
            jetty.moveTo([1,0]).text("Waiting..");
            if(allPackagesDirectories.indexOf(packageElem) === allPackagesDirectories.length - 1) {
                jetty.moveTo([2,0]);
                writeBat();
            }
        }
    });
}

function collectPackagesDirectories(elem, index) {
    var parentDirectory = baseDirectory + "\\" + elem;
    fs.readdir(parentDirectory, function(err, list) {
        if (err) throw(err);
        else {
            directoriesTree[elem] = {};
            allPackagesDirectories = list;
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

readRootDirectory();
