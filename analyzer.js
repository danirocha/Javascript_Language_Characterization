var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');

var dirName = ".\\src";

fs.readdir(dirName, function(err, files) {
    if (err)
        throw err;

    files.map(function(file) {
        return path.join(dirName, file);
    }).filter(function(file) {
        return file;
    }).forEach(function(file) {
        fs.readFile(file, function(err, logData) {

            if (err)
                throw err;

            var text = logData.toString();

            var syntax = esprima.parse(text, {
                loc: true
            });
            var linhaFinal = 0;

            estraverse.traverse(syntax, {
                enter: function(node) {
                    var linha = node.loc.end.line;

                    if (linha > linhaFinal)
                        linhaFinal = linha;
                }
            });

            console.log("Total lines of code of " + file.substr(+4) + " file = " + linhaFinal);
        });
    });
});
