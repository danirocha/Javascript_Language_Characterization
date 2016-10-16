var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');

var p = ".\\src";

fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }

    files.map(function (file) {
        return path.join(p, file);
    }).filter(function (file) {
        return fs.statSync(file).isFile();
    }).forEach(function (file) {
        fs.readFile(file, function ( err, logData ) {

            if ( err ) throw err;

            var text = logData.toString();

            var syntax = esprima.parse(text, {loc: true} );
            var linhaFinal = 0;

            estraverse.traverse(syntax, {
                enter: function(node) {
                    var linha = node.loc.end.line;

                    if(linha > linhaFinal)
                        linhaFinal = linha;
                }
            });

            console.log("Número de linhas total do código " + file + ": " + linhaFinal);
        });
    });
});
