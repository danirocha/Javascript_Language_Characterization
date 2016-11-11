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

    escreverArquivo(file,linhaFinalPrograma,funcoes,numeroVariaveisPrograma);
}

function escreverArquivo(file, linhaFinal, funcoes, numeroVariaveisPrograma) {
    
    var infos = "";
    var numeroVariaveisFuncoes = 0;
    var numeroLinhasFuncoes = 0;

    infos = infos + "---------------------------------------------------------------------\r\n"
                  + "INFORMATION ABOUT THE PROGRAM\r\n"
                  + "   Total lines of code of " + file.substr(+4) + " file = " + linhaFinal + "\r\n"
                  + "   Total number of functions of  " + file.substr(+4) + " file = " + funcoes.length + "\r\n"
                  + "   Total of var in file " + file.substr(+4) + " = " + numeroVariaveisPrograma + "\r\n";
                  + "---------------------------------------------------------------------\r\n\r\n\r\n";

    infos = infos + "INFORMATION ABOUT EACH FUNCTION\r\n"
                  + "-----------------------------------------------------------------------------------------\r\n"
                  + "|   nome    |   LOC |   variaveis   |   chamada funçoes |   complexidade ciclomatica    |\r\n"
                  + "-----------------------------------------------------------------------------------------\r\n";

    for (var i = 0; i < funcoes.length; i++) {
        infos = infos + "|  " + funcoes[i].nome + " |   " + funcoes[i].numeroLinhas + " |   " + funcoes[i].numeroVariaveis + " |    "
                      + funcoes[i].numeroChamadas +  "  |   " + (funcoes[i].numeroIf + funcoes[i].numeroFor) + "    |   \r\n"
                      + "-----------------------------------------------------------------------------------------\r\n";

        if(funcoes[i].funcaoPai === 1)
        {
            numeroLinhasFuncoes = numeroLinhasFuncoes + funcoes[i].numeroLinhas;
            checarFilhos(funcoes,i,1);
            checarFilhos(funcoes,i,2);
            checarFilhos(funcoes,i,3);
        }

        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i].numeroVariaveis;
    }

    //infos = infos + "Total lines of code of functions in " + file.substr(+4) + " = " + numeroLinhasFuncoes + "\r\n";
    //infos = infos + "Total of global var in file " + file.substr(+4) + " = " + (numeroVariaveisPrograma - numeroVariaveisFuncoes) + "\r\n";
   // infos = infos + "---------------------------------------------------------------------\r\n";

    fs.writeFile("Relatorio Programa.txt", infos, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
}

function contaLinhas(node,linhaFinalPrograma) {
    if(linhaFinalPrograma < node.loc.end.line)
        return node.loc.end.line;
    
    return linhaFinalPrograma;
}

function contaFuncoes(node,funcoes,linhaFinalFuncao) {
    var funcao = {nome: '', numeroLinhas: '', funcaoPai: -1, numeroVariaveis: 0, numeroChamadas: 0, numeroIf: 0, numeroFor: 0};
    var linhaFinal = 0;

    if((node.type === 'FunctionDeclaration') || (node.type === 'FunctionExpression'))
    {
        linhaFinal = node.loc.end.line;

        if(node.id !== null)
            funcao.nome = node.id.name;
        else
            funcao.nome = '';

        funcao.numeroLinhas = (node.loc.end.line - node.loc.start.line) + 1;

        if(linhaFinal > linhaFinalFuncao)
            funcao.funcaoPai = 1;
        
        linhaFinalFuncao = node.loc.end.line;

        estraverse.traverse(node, {
            enter: function(node) {
                funcao.numeroVariaveis = funcao.numeroVariaveis + contaVariaveis(node);
                funcao.numeroChamadas = funcao.numeroChamadas + contaChamadasFuncoes(node);
                funcao.numeroIf = funcao.numeroIf + contaIfFuncoes(node);
                funcao.numeroFor = funcao.numeroFor + contaForFuncoes(node);
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

function checarFilhos(funcoes,i,escolha) {
    var j = i+1;
    var count = 0;

    while(j < funcoes.length && funcoes[j].funcaoPai !== 1)
    {
        count++;
        j++;
    }

    var h = count;
    var numeroFilhos = 0;

    while(h > 0)
    {
        if(escolha === 1)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroChamadas;
            h--;
            funcoes[i+h].numeroChamadas = funcoes[i+h].numeroChamadas - numeroFilhos;
        }

        if(escolha === 2)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroVariaveis;
            h--;
            funcoes[i+h].numeroVariaveis = funcoes[i+h].numeroVariaveis - numeroFilhos;
        }

        if(escolha === 3)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroIf;
            h--;
            funcoes[i+h].numeroIf = funcoes[i+h].numeroIf - numeroFilhos;
        }

        if(escolha === 4)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroFor;
            h--;
            funcoes[i+h].numeroFor = funcoes[i+h].numeroFor - numeroFilhos;
        }
    }
}

function contaIfFuncoes(node) {
    if(node.type === 'IfStatement')
        return 1;

    return 0;
}

function contaForFuncoes(node) {
    if(node.type === 'ForStatement')
        return 1;

    return 0;
}