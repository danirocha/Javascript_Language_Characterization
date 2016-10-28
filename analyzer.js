var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');

var dirName = ".\\src";

readDirectory();

function readDirectory() {
    fs.readdir(dirName, function(err, files) {
        if (err)
            throw err;
    
        readFiles(dirName, files);
    });
}

function readFiles(dirName, files) {
    files.map(function(file) {
        return path.join(dirName, file);
    }).filter(function(file) {
        return file.substr(-3) === '.js';
    }).forEach(function(file) {
        fs.readFile(file, function(err, logData) {

            if (err)
                throw err;

            var text = logData.toString();
            
            esprimaParse(text, file);
        });
      });
}

function esprimaParse(text, file) {

    var syntax = esprima.parse(text, {
        loc: true
    });
    
    var linhaFinal = 0;
    var funcoes = [];
    //var numeroLinhasFuncoes = 0;

    estraverse.traverse(syntax, {
        enter: function(node) {

            linhaFinal = contaLinhas(node);

            contaFuncoes(node,funcoes);
        }
    });

    console.log("---------------------------------------------------------------------");
    console.log("Total lines of code of " + file.substr(+4) + " file = " + linhaFinal);
    console.log("Total number of functions of  " + file.substr(+4) + " file = " + funcoes.length);
    for (var i = 0; i < funcoes.length; i++) {
        //numeroLinhasFuncoes = numeroLinhasFuncoes + funcoes[i].numeroLinhas;
        console.log("       The function: " + funcoes[i].nome + " has " + funcoes[i].numeroLinhas + " lines");
    }
    //console.log("Total lines of code of functions in " + file.substr(+4) + " = " + numeroLinhasFuncoes);
    console.log("---------------------------------------------------------------------");
}

function contaLinhas(node) {
    return linha = node.loc.end.line;
}

function contaFuncoes(node,funcoes) {
    var funcao = {nome: '', numeroLinhas: ''};

    if(node.type === 'FunctionDeclaration')
    {
        funcao.nome = node.id.name;
        funcao.numeroLinhas = (node.loc.end.line - node.loc.start.line) + 1;
        funcoes.push(funcao);
    }
}