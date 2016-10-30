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
    
    var linhaFinalPrograma = 0;
    var funcoes = [];
    var numeroVariaveisPrograma = 0;
    var linhaFinalFuncao = 0;
    var chamadasFuncoes = 0;

    estraverse.traverse(syntax, {
        enter: function(node) {

            linhaFinalPrograma = contaLinhas(node,linhaFinalPrograma);

            linhaFinalFuncao = contaFuncoes(node,funcoes,linhaFinalFuncao);

            numeroVariaveisPrograma = numeroVariaveisPrograma + contaVariaveis(node);

            chamadasFuncoes = chamadasFuncoes + contaChamadasFuncoes(node);
        }
    });

    printedConsole(file,linhaFinalPrograma,funcoes,numeroVariaveisPrograma);
}

function printedConsole(file, linhaFinal,funcoes,numeroVariaveisPrograma) {
    var numeroVariaveisFuncoes = 0;
    var numeroLinhasFuncoes = 0;

    console.log("---------------------------------------------------------------------");
    console.log("Total lines of code of " + file.substr(+4) + " file = " + linhaFinal);
    console.log("Total number of functions of  " + file.substr(+4) + " file = " + funcoes.length);

    for (var i = 0; i < funcoes.length; i++) {
        console.log("       The function: " + funcoes[i].nome + " has " + funcoes[i].numeroLinhas + " lines");

        if(funcoes[i].funcaoPai === 1)
        {
            numeroLinhasFuncoes = numeroLinhasFuncoes + funcoes[i].numeroLinhas;
            checarChamadas(funcoes,i);
            checarVariaveis(funcoes,i);
        }

        console.log("       Total of var in function " + funcoes[i].nome + " = " + + funcoes[i].numeroVariaveis);
        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i].numeroVariaveis;

        console.log("       Total of functions call in function " + funcoes[i].nome + " = " + + funcoes[i].numeroChamadas);
    }

    console.log("Total lines of code of functions in " + file.substr(+4) + " = " + numeroLinhasFuncoes);
    console.log("Total of var in file " + file.substr(+4) + " = " + numeroVariaveisPrograma);
    console.log("Total of global var in file " + file.substr(+4) + " = " + (numeroVariaveisPrograma - numeroVariaveisFuncoes));
    console.log("---------------------------------------------------------------------");
}

function contaLinhas(node,linhaFinalPrograma) {
    if(linhaFinalPrograma < node.loc.end.line)
        return node.loc.end.line;
    
    return linhaFinalPrograma;
}

function contaFuncoes(node,funcoes,linhaFinalFuncao) {
    var funcao = {nome: '', numeroLinhas: '', funcaoPai: -1, numeroVariaveis: 0, numeroChamadas: 0};
    var linhaFinal = 0;

    if(node.type === 'FunctionDeclaration')
    {
        linhaFinal = node.loc.end.line;

        funcao.nome = node.id.name;
        funcao.numeroLinhas = (node.loc.end.line - node.loc.start.line) + 1;

        if(linhaFinal > linhaFinalFuncao)
            funcao.funcaoPai = 1;
        
        linhaFinalFuncao = node.loc.end.line;

        estraverse.traverse(node, {
            enter: function(node) {
                funcao.numeroVariaveis = funcao.numeroVariaveis + contaVariaveis(node);
                funcao.numeroChamadas = funcao.numeroChamadas + contaChamadasFuncoes(node);
            }
        });

        funcoes.push(funcao);
    }

    return linhaFinalFuncao;
}

function contaVariaveis(node) {
    if(node.type === 'VariableDeclaration')
        return 1;

    return 0;
}

function contaChamadasFuncoes(node) {
    if(node.type === 'CallExpression')
        return 1;

    return 0;
}

function checarChamadas(funcoes,i) {
    var j = i+1;
    var count = 0;

    while(j < funcoes.length && funcoes[j].funcaoPai !== 1)
    {
        count++;
        j++;
    }

    var h = count;
    var numeroChamadasFuncoes = 0;

    while(h > 0)
    {
        numeroChamadasFuncoes = numeroChamadasFuncoes + funcoes[i+h].numeroChamadas;
        h--;
        funcoes[i+h].numeroChamadas = funcoes[i+h].numeroChamadas - numeroChamadasFuncoes;
    }
}

function checarVariaveis(funcoes,i) {
    var j = i+1;
    var count = 0;

    while(j < funcoes.length && funcoes[j].funcaoPai !== 1)
    {
        count++;
        j++;
    }

    var h = count;
    var numeroVariaveisFuncoes = 0;

    while(h > 0)
    {
        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i+h].numeroVariaveis;
        h--;
        funcoes[i+h].numeroVariaveis = funcoes[i+h].numeroVariaveis - numeroVariaveisFuncoes;
    }
}