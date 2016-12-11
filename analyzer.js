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

var funcoesSemNome = 1;

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
    var funcao = {nome: '', numeroLinhas: 0, funcaoPai: -1, 
                  numeroAssignment: 0, Array: 0, Block: 0, Binary:0, Break: 0, 
                  numeroChamadas: 0, Catch: 0, Conditional: 0, Continue: 0, numeroDoWhile: 0,
                  Debugger: 0, Empty: 0, Expression: 0, numeroFor: 0, ForIn: 0,
                  numeroFunctionD: 0, FunctionE: 0, Identifier: 0, numeroIf: 0, Literal: 0, Label: 0,
                  Logical: 0, Member: 0, NewExpression: 0, Object: 0, Property: 0,
                  Return: 0, Sequence: 0, Switch: 0, numeroSwitchCase: 0, This: 0,
                  Throw: 0, Try: 0, Unary: 0, Update: 0,
                  numeroVariaveis: 0, numeroVariaveisD: 0, numeroWhile: 0, With: 0
                };

    var linhaFinal = 0;

    if((node.type === 'FunctionDeclaration') || (node.type === 'FunctionExpression'))
    {
        linhaFinal = node.loc.end.line;

        if(node.id !== null)
            funcao.nome = node.id.name;
        else
        {
            funcao.nome = 'Funcao sem nome' + funcoesSemNome;
            funcoesSemNome++;
        }

        funcao.numeroLinhas = (node.loc.end.line - node.loc.start.line) + 1;

        if(linhaFinal > linhaFinalFuncao)
        {
            funcao.funcaoPai = 1;
            linhaFinalFuncao = node.loc.end.line;
        }

        estraverse.traverse(node, {
            enter: function(node) {
                
                for(var j = 0; j < nosEsprima.length; j++) 
                    contaNos(node, nosEsprima[j], j);

                funcao.numeroAssignment = quantidadeNosEsprimas[0];
                funcao.Array = quantidadeNosEsprimas[1];
                funcao.Block = quantidadeNosEsprimas[2];
                funcao.Binary = quantidadeNosEsprimas[3];
                funcao.Break = quantidadeNosEsprimas[4];
                funcao.numeroChamadas = quantidadeNosEsprimas[5]
                funcao.Catch = quantidadeNosEsprimas[6];
                funcao.Conditional = quantidadeNosEsprimas[7];
                funcao.Continue = quantidadeNosEsprimas[8];
                funcao.numeroDoWhile = quantidadeNosEsprimas[9];
                funcao.Debugger = quantidadeNosEsprimas[10];
                funcao.Empty = quantidadeNosEsprimas[11];
                funcao.Expression = quantidadeNosEsprimas[12];
                funcao.numeroFor = quantidadeNosEsprimas[13];
                funcao.ForIn = quantidadeNosEsprimas[14];
                funcao.numeroFunctionD = quantidadeNosEsprimas[15];
                funcao.FunctionE = quantidadeNosEsprimas[16];
                funcao.Identifier = quantidadeNosEsprimas[17];
                funcao.numeroIf = quantidadeNosEsprimas[18];
                funcao.Literal = quantidadeNosEsprimas[19];
                funcao.Label = quantidadeNosEsprimas[20];
                funcao.Logical = quantidadeNosEsprimas[21];
                funcao.Member = quantidadeNosEsprimas[22];
                funcao.NewExpression = quantidadeNosEsprimas[23];
                funcao.Object = quantidadeNosEsprimas[24];
                funcao.Property = quantidadeNosEsprimas[25];
                funcao.Return = quantidadeNosEsprimas[26];
                funcao.Sequence = quantidadeNosEsprimas[27];
                funcao.Switch = quantidadeNosEsprimas[28];
                funcao.numeroSwitchCase = quantidadeNosEsprimas[29];
                funcao.This = quantidadeNosEsprimas[30];
                funcao.Throw = quantidadeNosEsprimas[31];
                funcao.Try = quantidadeNosEsprimas[32];
                funcao.Unary = quantidadeNosEsprimas[33];
                funcao.Update = quantidadeNosEsprimas[34];
                funcao.numeroVariaveis = quantidadeNosEsprimas[35];
                funcao.numeroVariaveisD = quantidadeNosEsprimas[36];
                funcao.numeroWhile = quantidadeNosEsprimas[37];
                funcao.With = quantidadeNosEsprimas[38]; 
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

    
    while(count > 0)
    {
        
        if(escolha === 0)
        {
            funcoes[i].numeroAssignment = funcoes[i].numeroAssignment - funcoes[i+count].numeroAssignment;
            count--;
        }

        else if (escolha === 1)
        {
            funcoes[i].Array = funcoes[i].Array - funcoes[i+count].Array;
            count--;
        }

        else if(escolha === 2)
        {
            funcoes[i].Block = funcoes[i].Block - funcoes[i+count].Block;
            count--;
        }

        else if(escolha === 3)
        {
            funcoes[i].Binary = funcoes[i].Binary + funcoes[i+count].Binary;
            count--;
        }

        else if(escolha === 4)
        {
            funcoes[i].Break = funcoes[i].Break + funcoes[i+count].Break;
            count--;
        }

        else if(escolha === 5)
        {
            funcoes[i].numeroChamadas = funcoes[i].numeroChamadas + funcoes[i+count].numeroChamadas;
            count--;
        }

        else if(escolha === 6)
        {
            funcoes[i].Catch = funcoes[i].Catch + funcoes[i+count].Catch;
            count--;
        }

        else if(escolha === 7)
        {
            funcoes[i].Conditional = funcoes[i].Conditional + funcoes[i+count].Conditional;
            count--;
        }

        else if(escolha === 8)
        {
            funcoes[i].Continue = funcoes[i].Continue + funcoes[i+count].Continue;
            count--;
        }

        else if(escolha === 9)
        {
            funcoes[i].numeroDoWhile = funcoes[i].numeroDoWhile + funcoes[i+count].numeroDoWhile;
            count--;
        }

        else if(escolha === 10)
        {
            funcoes[i].Debugger = funcoes[i].Debugger + funcoes[i+count].Debugger;
            count--;
        }

        else if(escolha === 11)
        {
            funcoes[i].Empty = funcoes[i].Empty + funcoes[i+count].Empty;
            count--;
        }

        else if(escolha === 12)
        {
            funcoes[i].Expression = funcoes[i].Expression + funcoes[i+count].Expression;
            count--;
        }

        else if(escolha === 13)
        {
            funcoes[i].numeroFor = funcoes[i].numeroFor + funcoes[i+count].numeroFor;
            count--;
        }

        else if(escolha === 14)
        {
            funcoes[i].ForIn = funcoes[i].ForIn + funcoes[i+count].ForIn;
            count--;
        }

        else if(escolha === 15)
        {
            funcoes[i].numeroFunctionD = funcoes[i].numeroFunctionD + funcoes[i+count].numeroFunctionD;
            count--;
        }

        else if(escolha === 16)
        {
            funcoes[i].FunctionE = funcoes[i].FunctionE + funcoes[i+count].FunctionE;
            count--;
        }

        else if(escolha === 17)
        {
            funcoes[i].Identifier = funcoes[i].Identifier + funcoes[i+count].Identifier;
            count--;
        }

        else if(escolha === 18)
        {
            funcoes[i].numeroIf = funcoes[i].numeroIf + funcoes[i+count].numeroIf;
            count--;
        }

        else if(escolha === 19)
        {
            funcoes[i].Literal = funcoes[i].Literal + funcoes[i+count].Literal;
            count--;
        }

        else if(escolha === 20)
        {
            funcoes[i].Label = funcoes[i].Label + funcoes[i+count].Label;
            count--;
        }

        else if(escolha === 21)
        {
            funcoes[i].Logical = funcoes[i].Logical + funcoes[i+count].Logical;
            count--;
        }

        else if(escolha === 22)
        {
            funcoes[i].Member = funcoes[i].Member + funcoes[i+count].Member;
            count--;
        }

        else if(escolha === 23)
        {
            funcoes[i].NewExpression = funcoes[i].NewExpression + funcoes[i+count].NewExpression;
            count--;
        }

        else if(escolha === 24)
        {
            funcoes[i].Object = funcoes[i].Object + funcoes[i+count].Object;
            count--;
        }

        else if(escolha === 25)
        {
            funcoes[i].Property = funcoes[i].Property + funcoes[i+count].Property;
            count--;
        }

        else if(escolha === 26)
        {
            funcoes[i].Return = funcoes[i].Return + funcoes[i+count].Return;
            count--;
        }

        else if(escolha === 27)
        {
            funcoes[i].Sequence = funcoes[i].Sequence + funcoes[i+count].Sequence;
            count--;
        }

        else if(escolha === 28)
        {
            funcoes[i].Switch = funcoes[i].Switch + funcoes[i+count].Switch;
            count--;
        }

        else if(escolha === 29)
        {
            funcoes[i].numeroSwitchCase = funcoes[i].numeroSwitchCase + funcoes[i+count].numeroSwitchCase;
            count--;
        }

        else if(escolha === 30)
        {
            funcoes[i].This = funcoes[i].This + funcoes[i+count].This;
            count--;
        }

        else if(escolha === 31)
        {
            funcoes[i].Throw = funcoes[i].Throw + funcoes[i+count].Throw;
            count--;
        }

        else if(escolha === 32)
        {
            funcoes[i].Try = funcoes[i].Try + funcoes[i+count].Try;
            count--;
        }

        else if(escolha === 33)
        {
            funcoes[i].Unary = funcoes[i].Unary + funcoes[i+count].Unary;
            count--;
        }

        else if(escolha === 34)
        {
            funcoes[i].Update = funcoes[i].Update + funcoes[i+count].Update;
            count--;
        }

        else if(escolha === 35)
        {
            funcoes[i].numeroVariaveis = funcoes[i].numeroVariaveis + funcoes[i+count].numeroVariaveis;
            count--;
        }

        else if(escolha === 36)
        {
            funcoes[i].numeroVariaveisD = funcoes[i].numeroVariaveisD + funcoes[i+count].numeroVariaveisD;
            count--;
        }

        else if(escolha === 37)
        {
            funcoes[i].numeroWhile = funcoes[i].numeroWhile + funcoes[i+count].numeroWhile;
            count--;
        }

         else if(escolha === 38)
        {
            funcoes[i].With = funcoes[i].With + funcoes[i+count].With;
            count--;
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
        
        if(funcoes[i].funcaoPai === 1)
        {
            for(var j = 0; j < 39; j++)
            checarFilhos(funcoes,i,j);
        }
        
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

        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i].numeroVariaveis;
    }

    var tableC = tableN.table(rowsFuncoes, 100);
    infosFuncoes = "INFORMATION ABOUT EACH FUNCTION\n" + tableC + "\n---------------------------------------------------------------------\n";

     var tableE = tableN.table(rowsNosEsprimas);
    infosNosEsprima = "INFORMATION ABOUT EACH FUNCTION AND ESPRIMA NODE\n" + tableE;

    fs.writeFile("Relatorio Programa " + file.substr(+4) + ".txt", infosPrograma + infosFuncoes + infosNosEsprima, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The analyze for " + file.substr(+4) + " was saved!");
    }); 
}
