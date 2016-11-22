var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');
var tableN = require('ascii-data-table').default;

var nosEsprima = ['AssignmentExpression', 'ArrayExpression', 'BlockStatement', 'BinaryExpression', 'BreakStatement',
                  'CallExpression', 'CatchClause', 'ConditionalExpression', 'ContinueStatement', 'DoWhileStatement',
                  'DebuggerStatement', 'EmptyStatement', 'ExpressionStatement', 'ForStatement', 'ForInStatement',
                  'FunctionDeclaration', 'FunctionExpression', 'Identifier', 'IfStatement', 'Literal',
                  'LabeledStatement', 'LogicalExpression', 'MemberExpression', 'NewExpression',
                  'ObjectExpression', 'Property', 'ReturnStatement', 'SequenceExpression', 'SwitchStatement',
                  'SwitchCase', 'ThisExpression', 'ThrowStatement', 'TryStatement', 'UnaryExpression',
                  'UpdateExpression', 'VariableDeclaration', 'VariableDeclarator', 'WhileStatement', 'WithStatement'];


var quantidadeNosEsprimas = [0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0];

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

    estraverse.traverse(syntax, {
        enter: function(node) {

            linhaFinalPrograma = contaLinhas(node,linhaFinalPrograma);

            linhaFinalFuncao = contaFuncoes(node,funcoes,linhaFinalFuncao);

            numeroVariaveisPrograma = numeroVariaveisPrograma + contaVariaveis(node);
        }
    });

    escreverArquivo(file,linhaFinalPrograma,funcoes,numeroVariaveisPrograma);
}

function contaLinhas(node,linhaFinalPrograma) {
    if(linhaFinalPrograma < node.loc.end.line)
        return node.loc.end.line;
    
    return linhaFinalPrograma;
}

function contaFuncoes(node,funcoes,linhaFinalFuncao) {
    var funcao = {nome: '', numeroLinhas: 0, funcaoPai: -1, numeroVariaveis: 0, numeroChamadas: 0, numeroIf: 0, numeroFor: 0,
                  numeroWhile: 0, numeroDoWhile: 0, numeroSwitchCase: 0,
                  numeroAssignment: 0, Array: 0, Block: 0, Binary:0, Break: 0, Catch: 0, Conditional: 0, Continue: 0,
                  Debugger: 0, Empty: 0, Expression: 0,
                  ForIn: 0, numeroFunctionD: 0, FunctionE: 0,
                  Identifier: 0, Literal: 0, Label: 0,
                  Logical: 0, Member: 0, NewExpression: 0, Object: 0,
                  Property: 0, Return: 0, Sequence: 0, Switch: 0,
                  This: 0, Throw: 0, Try: 0, Unary: 0, Update: 0,
                  numeroVariaveisD: 0, numeroWhile: 0, With: 0
                };

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
                
                for(var j = 0; j < nosEsprima.length; j++) 
                    contaNos(node, nosEsprima[j], j);

                funcao.numeroVariaveis = quantidadeNosEsprimas[35];
                funcao.numeroChamadas = quantidadeNosEsprimas[5];
                //funcao.numeroIf = funcao.numeroIf + contaIfFuncoes(node);
               // funcao.numeroFor = funcao.numeroFor + contaForFuncoes(node);
               // funcao.numeroWhile = funcao.numeroWhile + contaWhileFuncoes(node);
               // funcao.numeroDoWhile = funcao.numeroDoWhile + contaDoWhileFuncoes(node);
               // funcao.numeroSwitchCase = funcao.numeroSwitchCase + contaSwitchCaseFuncoes(node);
            }
        });

        funcoes.push(funcao);

        quantidadeNosEsprimas = [0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0];
    }

    return linhaFinalFuncao;
}

function contaVariaveis(node) {
    if(node.type === 'VariableDeclaration')
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
            funcoes[i].numeroChamadas = funcoes[i].numeroChamadas - numeroFilhos;
        }

        if(escolha === 2)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroVariaveis;
            h--;
            funcoes[i].numeroVariaveis = funcoes[i].numeroVariaveis - numeroFilhos;
        }

        if(escolha === 3)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroIf;
            h--;
            funcoes[i].numeroIf = funcoes[i].numeroIf - numeroFilhos;
        }

        if(escolha === 4)
        {
            numeroFilhos = numeroFilhos + funcoes[i+h].numeroFor;
            h--;
            funcoes[i].numeroFor = funcoes[i].numeroFor - numeroFilhos;
        }
    }
}

 function contaNos(node, noEsprima, j) 
 {
     if(node.type === noEsprima)
        quantidadeNosEsprimas[j]++;
}

function escreverArquivo(file, linhaFinal, funcoes, numeroVariaveisPrograma) {
    
    var infosPrograma = "";
    var infosFuncoes = "";
    var infosNosEsprima = "";
    var numeroVariaveisFuncoes = 0;
    var numeroLinhasFuncoes = 0;

    infosPrograma = infosPrograma + "---------------------------------------------------------------------\n"
                  + "INFORMATION ABOUT THE PROGRAM\r\n"
                  + "   Total lines of code of " + file.substr(+4) + " file = " + linhaFinal + "\n"
                  + "   Total number of functions of  " + file.substr(+4) + " file = " + funcoes.length + "\n"
                  + "   Total of var in file " + file.substr(+4) + " = " + numeroVariaveisPrograma + "\n"
                  + "---------------------------------------------------------------------\n";

    var rowsFuncoes = [['nome', 'LOC', 'variaveis', 'chamada de funcoes', 'complexidade ciclomatica  (if, for, while, do...While, switch cases)']];

    var rowsNosEsprimas = [['nome','AssignmentExpression', 'ArrayExpression', 'BlockStatement', 'BinaryExpression' ,'BreakStatement',
                            'CallExpression', 'CatchClause', 'ConditionalExpression', 'ContinueStatement', 'DoWhileStatement',
                            'DebuggerStatement', 'EmptyStatement', 'ExpressionStatement', 'ForStatement', 'ForInStatement',
                            'FunctionDeclaration', 'FunctionExpression', 'Identifier', 'IfStatement', 'Literal', 'LabeledStatement',
                            'LogicalExpression', 'MemberExpression', 'NewExpression', 'ObjectExpression', 'Property',
                            'ReturnStatement', 'SequenceExpression', 'SwitchStatement', 'SwitchCase', 'ThisExpression',
                            'ThrowStatement', 'TryStatement', 'UnaryExpression', 'UpdateExpression', 'VariableDeclaration',
                            'VariableDeclarator', 'WhileStatement', 'WithStatement']];

    for (var i = 0; i < funcoes.length; i++) {
        rowsFuncoes.push([funcoes[i].nome, funcoes[i].numeroLinhas, funcoes[i].numeroVariaveis, 
                   funcoes[i].numeroChamadas, funcoes[i].numeroIf + funcoes[i].numeroFor + funcoes[i].numeroWhile + funcoes[i].numeroDoWhile + funcoes[i].numeroSwitchCase]);
           
        rowsNosEsprimas.push([funcoes[i].nome, funcoes[i].numeroAssignment, funcoes[i].Array, funcoes[i].Block, funcoes[i].Binary, funcoes[i].Break, 
                              funcoes[i].numeroChamadas, funcoes[i].Catch, funcoes[i].Conditional, funcoes[i].Continue, funcoes[i].numeroDoWhile,
                              funcoes[i].Debugger, funcoes[i].Empty, funcoes[i].Expression, funcoes[i].numeroFor, funcoes[i].ForIn,
                              funcoes[i].numeroFunctionD, funcoes[i].FunctionE, funcoes[i].Identifier, funcoes[i].numeroIf, funcoes[i].Literal, funcoes[i].Label,
                              funcoes[i].Logical, funcoes[i].Member, funcoes[i].NewExpression, funcoes[i].Object, funcoes[i].Property,
                              funcoes[i].Return, funcoes[i].Sequence, funcoes[i].Switch, funcoes[i].numeroSwitchCase, funcoes[i].This,
                              funcoes[i].Throw, funcoes[i].Try, funcoes[i].Unary, funcoes[i].Update, funcoes[i].numeroVariaveis,
                              funcoes[i].numeroVariaveisD, funcoes[i].numeroWhile, funcoes[i].With
                            ]);

        if(funcoes[i].funcaoPai === 1)
        {
            numeroLinhasFuncoes = numeroLinhasFuncoes + funcoes[i].numeroLinhas;
            checarFilhos(funcoes,i,1);
            checarFilhos(funcoes,i,2);
            checarFilhos(funcoes,i,3);
        }

        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i].numeroVariaveis;
    }

    var tableC = tableN.table(rowsFuncoes, 100);
    infosFuncoes = "INFORMATION ABOUT EACH FUNCTION\n" + tableC + "\n---------------------------------------------------------------------\n";

     var tableE = tableN.table(rowsNosEsprimas);
    infosNosEsprima = "INFORMATION ABOUT EACH FUNCTION AND ESPRIMA NODE\n" + tableE;

    //infos = infos + "Total lines of code of functions in " + file.substr(+4) + " = " + numeroLinhasFuncoes + "\r\n";
    //infos = infos + "Total of global var in file " + file.substr(+4) + " = " + (numeroVariaveisPrograma - numeroVariaveisFuncoes) + "\r\n";
   // infos = infos + "---------------------------------------------------------------------\r\n";

    fs.writeFile("Relatorio Programa " + file.substr(+4) + ".txt", infosPrograma + infosFuncoes + infosNosEsprima, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The analyze for " + file.substr(+4) + " was saved!");
    }); 
}
