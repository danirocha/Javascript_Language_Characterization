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

var linhaFinalFuncaoPai = 0;

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

            console.log("Analyzing file " +  file.substr(+4));

            esprimaParse(text, file);

            linhaFinalFuncaoPai = 0;
        });
      });
}

function esprimaParse(text, file) {
    var syntax = esprima.parse(text, {
        loc: true,
        tokens: true
    });

    var linhaFinalPrograma = 0;
    var funcoes = [];
    var numeroVariaveisPrograma = 0;
    var linhaFinalFuncao = 0;
     var soma = 0;

    estraverse.traverse(syntax, {
        enter: function(node) {

            procuraFuncoes(node, funcoes);

            linhaFinalPrograma = contaLinhas(node,linhaFinalPrograma);

            numeroVariaveisPrograma = numeroVariaveisPrograma + contaVariaveis(node);

        }
    });

    for(var i = 0; i < funcoes.length; i++)
    {
        linhaFinalFuncao = contaFuncoes(funcoes[i].nodeFuncao,funcoes[i].funcao,linhaFinalFuncao, i, funcoes);
    };

    calculaOperandos(syntax.tokens, funcoes);

    escreverArquivo(file,linhaFinalPrograma,funcoes,numeroVariaveisPrograma);

    escreveArquivoR(file, linhaFinalPrograma, funcoes, numeroVariaveisPrograma);
}

function calculaOperandos(tokens, funcoes)
{
    for(var i = 0; i < funcoes.length; i++) {
        
        if(funcoes[i].funcao.funcaoPai === -1)
        {
            var tokenInicio = 0;
            var tokenFim = 0;

            for(var indexToken = 0; indexToken < tokens.length; indexToken++) {
                if(funcoes[i].nodeInicial.loc.start.line === tokens[indexToken].loc.start.line && funcoes[i].nodeInicial.loc.start.column === tokens[indexToken].loc.start.column) {
                        tokenInicio = indexToken;
                }

                else if(funcoes[i].nodeInicial.loc.end.line === tokens[indexToken].loc.end.line && funcoes[i].nodeInicial.loc.end.column === tokens[indexToken].loc.end.column) {
                        tokenFim = indexToken;
                }
            }

            for (var indexToken = tokenInicio; indexToken <= tokenFim; indexToken++) {
                classificaToken(indexToken, funcoes[i].funcao, tokens);
            }
        }

        else {
            var j = i+1;
            var count = 0;

            while(j < funcoes.length && funcoes[j].funcao.funcaoPai !== 1)
            {
                count++;
                j++;
            }

            var pertenceFilho = false;

            for(var indexToken = 0; indexToken < tokens.length; indexToken++) {
                for(var h = i+1; h <= i+count; h++) {
                        if(tokens[indexToken].loc.start.line >= funcoes[h].nodeInicial.loc.start.line) {
                            if(tokens[indexToken].loc.end.line <= funcoes[h].nodeInicial.loc.end.line) {
                                pertenceFilho = true;
                            }
                        }
                    }
                
                if(!pertenceFilho) {

                     if(tokens[indexToken].loc.start.line >= funcoes[i].nodeInicial.loc.start.line) {
                            if(tokens[indexToken].loc.end.line <= funcoes[i].nodeInicial.loc.end.line) {
                                 classificaToken(indexToken, funcoes[i].funcao, tokens);
                            }
                     }
                }

                pertenceFilho = false;
            }
        }
    }
}

function classificaToken(i, funcao, tokens) {
    
    var existeToken = false;

    if(tokens[i].type === "Keyword" || tokens[i].type === "Punctuator") {
        if(tokens[i].value === ")" || tokens[i].value === "}" || tokens[i].value === "," || tokens[i].value === ";" || tokens[i].value === "]")
            return;
            
        for(var j = 0; j < funcao.operadores.length; j++) {
            if(funcao.operadores[j] === tokens[i].value) {
                existeToken = true;
            }
        }

        if(!existeToken)
            funcao.operadores.push(tokens[i].value);

        funcao.operadoresTotal++;

        existeToken = false;
    }

    else if (tokens[i].type === "Identifier" || tokens[i].type === "String" || tokens[i].type === "Numeric") {
        for(var j = 0; j < funcao.operandos.length; j++) {
            if(funcao.operandos[j] === tokens[i].value) {
                existeToken = true;
            }
        }

        if(!existeToken)
            funcao.operandos.push(tokens[i].value);

        funcao.operandosTotal++;

        existeToken = false;            
    }
}

function procuraFuncoes(node, funcoes)
{
    if(node.type === 'FunctionDeclaration')
    {    
        var objeto = criaObjeto(node);

        objeto.funcao.nome = node.id.name;
        objeto.nodeFuncao = node;
        funcoes.push(objeto);
    }

    else if(node.type === 'ExpressionStatement')
    {
    
        var objeto = criaObjeto(node);

        if(node.expression.left && node.expression.right)
        {
            if(node.expression.left.object && node.expression.left.property)
            {
                if(node.expression.right.type === 'FunctionExpression')
                {
                    objeto.funcao.nome = node.expression.left.object.name + "." + node.expression.left.property.name;
                    objeto.nodeFuncao = node.expression.right;
                    funcoes.push(objeto);
                }
            }

            else
            {
                if(node.expression.right.type === 'FunctionExpression')
                {
                    objeto.funcao.nome = node.expression.left.name;
                    objeto.nodeFuncao = node.expression.right;
                    funcoes.push(objeto);
                }
            }
        }

         else if(node.expression.callee) {
            if(node.expression.callee.type === 'FunctionExpression') {
                if(node.expression.callee.id !== null) 
                    objeto.funcao.nome = node.node.expression.callee.id;
                else
                    objeto.funcao.nome = "Função anônima";
                
                objeto.nodeFuncao = node.expression.callee;
                funcoes.push(objeto);
            }
         }
    }

    else if(node.type === 'VariableDeclaration')
    {
        for(var i = 0; i < node.declarations.length; i++)
        {
            if(node.declarations[i].type === 'VariableDeclarator')
            {
                if(node.declarations[i].init)
                {
                    if(node.declarations[i].init.type === 'FunctionExpression')
                    {
                         var objeto = criaObjeto(node);

                        if(node.declarations[i].init.id === null)
                        {
                            objeto.funcao.nome = node.declarations[i].id.name;
                            objeto.nodeFuncao = node.declarations[i].init;
                            funcoes.push(objeto);
                        }

                        else
                        {
                            objeto.funcao.nome = node.declarations[i].init.id.name;
                            objeto.nodeFuncao = node.declarations[i].init;
                            funcoes.push(objeto);
                        }
                    }

                    else if(node.declarations[i].init.type === 'CallExpression')
                    {
                        var objeto = criaObjeto(node);

                        if(node.declarations[i].init.callee.type === 'FunctionExpression')
                        {
                            objeto.funcao.nome = node.declarations[i].id.name;
                            objeto.nodeFuncao = node.declarations[i].init.callee;
                            funcoes.push(objeto);
                        }                  
                    }

                    else if(node.declarations[i].init.type === 'NewExpression')
                    {
                         var objeto = criaObjeto(node);

                        if(node.declarations[i].init.callee.type === 'FunctionExpression')
                        {
                            objeto.funcao.nome = node.declarations[i].id.name;
                            objeto.nodeFuncao = node.declarations[i].init.callee;
                            funcoes.push(objeto);
                        }    
                    }

                    else if(node.declarations[i].init.type === 'ArrowFunctionExpression')
                    {
                        var objeto = criaObjeto(node);
                        
                        if(node.declarations[i].init.callee.type === 'FunctionExpression')
                        {
                            objeto.funcao.nome = node.declarations[i].id.name;
                            objeto.nodeFuncao = node.declarations[i].init.callee;
                            funcoes.push(objeto);
                        } 
                    }
                }
            }
        }
    }
}

function criaObjeto(node) {
     var funcao = {nome: '', numeroLinhas: 0, funcaoPai: -1, funcaoFilho: -1,
                  numeroAssignment: 0, Array: 0, Block: 0, Binary:0, Break: 0, 
                  numeroChamadas: 0, Catch: 0, Conditional: 0, Continue: 0, numeroDoWhile: 0,
                  Debugger: 0, Empty: 0, Expression: 0, numeroFor: 0, ForIn: 0,
                  numeroFunctionD: 0, FunctionE: 0, Identifier: 0, numeroIf: 0, Literal: 0, Label: 0,
                  Logical: 0, Member: 0, NewExpression: 0, Object: 0, Property: 0,
                  Return: 0, Sequence: 0, Switch: 0, numeroSwitchCase: 0, This: 0,
                  Throw: 0, Try: 0, Unary: 0, Update: 0,
                  numeroVariaveis: 0, numeroVariaveisD: 0, numeroWhile: 0, With: 0, 
                  operandosTotal: 0, operadoresTotal: 0,
                  operandos: [], operadores: []
                };
    
        var objeto = {funcao: funcao, nodeFuncao: node, nodeInicial: node};

        return objeto;
}

function contaLinhas(node,linhaFinalPrograma) {
    if(linhaFinalPrograma < node.loc.end.line)
        return node.loc.end.line;
    
    return linhaFinalPrograma;
}

function contaFuncoes(node,funcao,linhaFinalFuncao, i, funcoes) {

    var linhaFinal = 0;

    if((node.type === 'FunctionDeclaration') || (node.type === 'FunctionExpression'))
    {
        linhaFinal = node.loc.end.line;

        funcao.numeroLinhas = (node.loc.end.line - node.loc.start.line) + 1;
        
        if(linhaFinal < linhaFinalFuncaoPai) {
            if(linhaFinal > linhaFinalFuncao)
                funcao.funcaoFilho = 1;
            else {
                funcoes[i-1].funcao.funcaoPai = 1;
                funcao.funcaoFilho = 1;
            }
        }

        else {
            linhaFinalFuncaoPai = linhaFinal;
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

        quantidadeNosEsprimas = [0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0];
    }

    return linhaFinal;
}

function contaVariaveis(node) {
    if(node.type === 'VariableDeclaration')
        return 1;

    return 0;
}


function checarFilhos(funcoes,i,escolha) {
    var j = i+1;
    var count = 0;
    var filhos = 0;

    while(j < funcoes.length) {
        if(funcoes[j].funcao.funcaoPai === 1) {
            if(funcoes[j].funcao.funcaoFilho === -1)
                break;
            
            else {
                count++;
                filhos = checarFilhos(funcoes, j, escolha);
                //j = j + filhos + 1;
            }
        }

        else {
            count++;
        }

        j++;
    }

    filhos = count;

    while(count > 0)
    {
        
        if(escolha === 0)
        {
            funcoes[i].funcao.numeroAssignment = funcoes[i].funcao.numeroAssignment - funcoes[i+count].funcao.numeroAssignment;
            count--;
        }

        else if (escolha === 1)
        {
            funcoes[i].funcao.Array = funcoes[i].funcao.Array - funcoes[i+count].funcao.Array;
            count--;
        }

        else if(escolha === 2)
        {
            funcoes[i].funcao.Block = funcoes[i].funcao.Block - funcoes[i+count].funcao.Block;
            count--;
        }

        else if(escolha === 3)
        {
            funcoes[i].funcao.Binary = funcoes[i].funcao.Binary - funcoes[i+count].funcao.Binary;
            count--;
        }

        else if(escolha === 4)
        {
            funcoes[i].funcao.Break = funcoes[i].funcao.Break - funcoes[i+count].funcao.Break;
            count--;
        }

        else if(escolha === 5)
        {
            funcoes[i].funcao.numeroChamadas = funcoes[i].funcao.numeroChamadas - funcoes[i+count].funcao.numeroChamadas;
            count--;
        }

        else if(escolha === 6)
        {
            funcoes[i].funcao.Catch = funcoes[i].funcao.Catch - funcoes[i+count].funcao.Catch;
            count--;
        }

        else if(escolha === 7)
        {
            funcoes[i].funcao.Conditional = funcoes[i].funcao.Conditional - funcoes[i+count].funcao.Conditional;
            count--;
        }

        else if(escolha === 8)
        {
            funcoes[i].funcao.Continue = funcoes[i].funcao.Continue - funcoes[i+count].funcao.Continue;
            count--;
        }

        else if(escolha === 9)
        {
            funcoes[i].funcao.numeroDoWhile = funcoes[i].funcao.numeroDoWhile - funcoes[i+count].funcao.numeroDoWhile;
            count--;
        }

        else if(escolha === 10)
        {
            funcoes[i].funcao.Debugger = funcoes[i].funcao.Debugger - funcoes[i+count].funcao.Debugger;
            count--;
        }

        else if(escolha === 11)
        {
            funcoes[i].funcao.Empty = funcoes[i].funcao.Empty - funcoes[i+count].funcao.Empty;
            count--;
        }

        else if(escolha === 12)
        {
            funcoes[i].funcao.Expression = funcoes[i].funcao.Expression - funcoes[i+count].funcao.Expression;
            count--;
        }

        else if(escolha === 13)
        {
            funcoes[i].funcao.numeroFor = funcoes[i].funcao.numeroFor - funcoes[i+count].funcao.numeroFor;
            count--;
        }

        else if(escolha === 14)
        {
            funcoes[i].funcao.ForIn = funcoes[i].funcao.ForIn - funcoes[i+count].funcao.ForIn;
            count--;
        }

        else if(escolha === 15)
        {
            funcoes[i].funcao.numeroFunctionD = funcoes[i].funcao.numeroFunctionD - funcoes[i+count].funcao.numeroFunctionD;
            count--;
        }

        else if(escolha === 16)
        {
            funcoes[i].funcao.FunctionE = funcoes[i].funcao.FunctionE - funcoes[i+count].funcao.FunctionE;
            count--;
        }

        else if(escolha === 17)
        {
            funcoes[i].funcao.Identifier = funcoes[i].funcao.Identifier - funcoes[i+count].funcao.Identifier;
            count--;
        }

        else if(escolha === 18)
        {
            funcoes[i].funcao.numeroIf = funcoes[i].funcao.numeroIf - funcoes[i+count].funcao.numeroIf;
            count--;
        }

        else if(escolha === 19)
        {
            funcoes[i].funcao.Literal = funcoes[i].funcao.Literal - funcoes[i+count].funcao.Literal;
            count--;
        }

        else if(escolha === 20)
        {
            funcoes[i].funcao.Label = funcoes[i].funcao.Label - funcoes[i+count].funcao.Label;
            count--;
        }

        else if(escolha === 21)
        {
            funcoes[i].funcao.Logical = funcoes[i].funcao.Logical - funcoes[i+count].funcao.Logical;
            count--;
        }

        else if(escolha === 22)
        {
            funcoes[i].funcao.Member = funcoes[i].funcao.Member - funcoes[i+count].funcao.Member;
            count--;
        }

        else if(escolha === 23)
        {
            funcoes[i].funcao.NewExpression = funcoes[i].funcao.NewExpression - funcoes[i+count].funcao.NewExpression;
            count--;
        }

        else if(escolha === 24)
        {
            funcoes[i].funcao.Object = funcoes[i].funcao.Object - funcoes[i+count].funcao.Object;
            count--;
        }

        else if(escolha === 25)
        {
            funcoes[i].funcao.Property = funcoes[i].funcao.Property - funcoes[i+count].funcao.Property;
            count--;
        }

        else if(escolha === 26)
        {
            funcoes[i].funcao.Return = funcoes[i].funcao.Return - funcoes[i+count].funcao.Return;
            count--;
        }

        else if(escolha === 27)
        {
            funcoes[i].funcao.Sequence = funcoes[i].funcao.Sequence - funcoes[i+count].funcao.Sequence;
            count--;
        }

        else if(escolha === 28)
        {
            funcoes[i].funcao.Switch = funcoes[i].funcao.Switch - funcoes[i+count].funcao.Switch;
            count--;
        }

        else if(escolha === 29)
        {
            funcoes[i].funcao.numeroSwitchCase = funcoes[i].funcao.numeroSwitchCase - funcoes[i+count].funcao.numeroSwitchCase;
            count--;
        }

        else if(escolha === 30)
        {
            funcoes[i].funcao.This = funcoes[i].funcao.This - funcoes[i+count].funcao.This;
            count--;
        }

        else if(escolha === 31)
        {
            funcoes[i].funcao.Throw = funcoes[i].funcao.Throw - funcoes[i+count].funcao.Throw;
            count--;
        }

        else if(escolha === 32)
        {
            funcoes[i].funcao.Try = funcoes[i].funcao.Try - funcoes[i+count].funcao.Try;
            count--;
        }

        else if(escolha === 33)
        {
            funcoes[i].funcao.Unary = funcoes[i].funcao.Unary - funcoes[i+count].funcao.Unary;
            count--;
        }

        else if(escolha === 34)
        {
            funcoes[i].funcao.Update = funcoes[i].funcao.Update - funcoes[i+count].funcao.Update;
            count--;
        }

        else if(escolha === 35)
        {
            funcoes[i].funcao.numeroVariaveis = funcoes[i].funcao.numeroVariaveis - funcoes[i+count].funcao.numeroVariaveis;
            count--;
        }

        else if(escolha === 36)
        {
            funcoes[i].funcao.numeroVariaveisD = funcoes[i].funcao.numeroVariaveisD - funcoes[i+count].funcao.numeroVariaveisD;
            count--;
        }

        else if(escolha === 37)
        {
            funcoes[i].funcao.numeroWhile = funcoes[i].funcao.numeroWhile - funcoes[i+count].funcao.numeroWhile;
            count--;
        }

        else if(escolha === 38)
        {
            funcoes[i].funcao.With = funcoes[i].funcao.With - funcoes[i+count].funcao.With;
            count--;
        }
    }

    return filhos;
}

 function contaNos(node, noEsprima, j) 
 {
     if(node.type === noEsprima)
        quantidadeNosEsprimas[j]++;
}

function escreverArquivo(file, linhaFinal, funcoes, numeroVariaveisPrograma, soma) {
    
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

    var rowsFuncoes = [['nome', 'LOC', 'variaveis', 'chamada de funcoes', 'complexidade ciclomatica  (if, for, while, do...While, switch cases)', 'Volume Halstead', 'MI']];

    var rowsNosEsprimas = [['nome','AssignmentExpression', 'ArrayExpression', 'BlockStatement', 'BinaryExpression' ,'BreakStatement',
                            'CallExpression', 'CatchClause', 'ConditionalExpression', 'ContinueStatement', 'DoWhileStatement',
                            'DebuggerStatement', 'EmptyStatement', 'ExpressionStatement', 'ForStatement', 'ForInStatement',
                            'FunctionDeclaration', 'FunctionExpression', 'Identifier', 'IfStatement', 'Literal', 'LabeledStatement',
                            'LogicalExpression', 'MemberExpression', 'NewExpression', 'ObjectExpression', 'Property',
                            'ReturnStatement', 'SequenceExpression', 'SwitchStatement', 'SwitchCase', 'ThisExpression',
                            'ThrowStatement', 'TryStatement', 'UnaryExpression', 'UpdateExpression', 'VariableDeclaration',
                            'VariableDeclarator', 'WhileStatement', 'WithStatement']];

    for (var i = 0; i < funcoes.length; i++) {
        
        if(funcoes[i].funcao.funcaoPai === 1 && funcoes[i].funcao.funcaoFilho === -1)
        {
            for(var j = 0; j < 39; j++)
                checarFilhos(funcoes,i,j);
        }
        
        var volume = (funcoes[i].funcao.operandosTotal + funcoes[i].funcao.operadoresTotal ) * Math.log2(funcoes[i].funcao.operadores.length + funcoes[i].funcao.operandos.length);
        var complexidadeCiclomatica = funcoes[i].funcao.numeroIf + funcoes[i].funcao.numeroFor + funcoes[i].funcao.numeroWhile + funcoes[i].funcao.numeroDoWhile + funcoes[i].funcao.numeroSwitchCase + funcoes[i].funcao.Conditional + 1;
        var maintainability = Math.max(0, ((171 - (5.2 * Math.log(volume)) - (0.23 * (complexidadeCiclomatica)) - (16.2 * Math.log(funcoes[i].funcao.numeroLinhas)))*100) / 171);

        rowsFuncoes.push([funcoes[i].funcao.nome, funcoes[i].funcao.numeroLinhas, funcoes[i].funcao.numeroVariaveisD, 
                   funcoes[i].funcao.numeroChamadas, complexidadeCiclomatica, "(" + funcoes[i].funcao.operandosTotal + "+" + funcoes[i].funcao.operadoresTotal + ") * log2" + "(" + funcoes[i].funcao.operandos.length + "+" + funcoes[i].funcao.operadores.length + ") = " + volume, maintainability]);
           
        rowsNosEsprimas.push([funcoes[i].funcao.nome, funcoes[i].funcao.numeroAssignment, funcoes[i].funcao.Array, funcoes[i].funcao.Block, funcoes[i].funcao.Binary, funcoes[i].funcao.Break, 
                              funcoes[i].funcao.numeroChamadas, funcoes[i].funcao.Catch, funcoes[i].funcao.Conditional, funcoes[i].funcao.Continue, funcoes[i].funcao.numeroDoWhile,
                              funcoes[i].funcao.Debugger, funcoes[i].funcao.Empty, funcoes[i].funcao.Expression, funcoes[i].funcao.numeroFor, funcoes[i].funcao.ForIn,
                              funcoes[i].funcao.numeroFunctionD, funcoes[i].funcao.FunctionE, funcoes[i].funcao.Identifier, funcoes[i].funcao.numeroIf, funcoes[i].funcao.Literal, funcoes[i].funcao.Label,
                              funcoes[i].funcao.Logical, funcoes[i].funcao.Member, funcoes[i].funcao.NewExpression, funcoes[i].funcao.Object, funcoes[i].funcao.Property,
                              funcoes[i].funcao.Return, funcoes[i].funcao.Sequence, funcoes[i].funcao.Switch, funcoes[i].funcao.numeroSwitchCase, funcoes[i].funcao.This,
                              funcoes[i].funcao.Throw, funcoes[i].funcao.Try, funcoes[i].funcao.Unary, funcoes[i].funcao.Update, funcoes[i].funcao.numeroVariaveis,
                              funcoes[i].funcao.numeroVariaveisD, funcoes[i].funcao.numeroWhile, funcoes[i].funcao.With
                            ]);

        numeroVariaveisFuncoes = numeroVariaveisFuncoes + funcoes[i].funcao.numeroVariaveis;
    }

    var tableC = tableN.table(rowsFuncoes, 100);
    infosFuncoes = "INFORMATION ABOUT EACH FUNCTION\n" + tableC + "\n---------------------------------------------------------------------\n";

     var tableE = tableN.table(rowsNosEsprimas);
    infosNosEsprima = "INFORMATION ABOUT EACH FUNCTION AND ESPRIMA NODE\n" + tableE;

    fs.writeFile("Relatorio Programa " + file.substr(+4) + ".txt", infosPrograma + infosFuncoes + infosNosEsprima, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}

 function escreveArquivoR(file, linhaFinalPrograma, funcoes, numeroVariaveisPrograma) {
        
        var infosPrograma = "";

        infosPrograma = file.substr(+4).replace(".js", "") + ";biblioteca\n" +
                        "###;loc;" + linhaFinalPrograma + "\n" +
                        "###;var;" + funcoes.length + "\n" +
                        "###;func;" + numeroVariaveisPrograma + "\n";

        var infosFuncoes = "";
        var infosEsprima = "";

        for(var i = 0; i < funcoes.length; i++) {
             var volume = (funcoes[i].funcao.operandosTotal + funcoes[i].funcao.operadoresTotal ) * Math.log2(funcoes[i].funcao.operadores.length + funcoes[i].funcao.operandos.length);
             var complexidadeCiclomatica = funcoes[i].funcao.numeroIf + funcoes[i].funcao.numeroFor + funcoes[i].funcao.numeroWhile + funcoes[i].funcao.numeroDoWhile + funcoes[i].funcao.numeroSwitchCase + funcoes[i].funcao.Conditional +1;
             var maintainability = Math.max(0, ((171 - (5.2 * Math.log(volume)) - (0.23 * (complexidadeCiclomatica)) - (16.2 * Math.log(funcoes[i].funcao.numeroLinhas)))*100) / 171);
            
            infosFuncoes = infosFuncoes + funcoes[i].funcao.nome + ";loc;" + funcoes[i].funcao.numeroLinhas + "\n" +
                                          funcoes[i].funcao.nome + ";var;" + funcoes[i].funcao.numeroVariaveisD + "\n" +
                                          funcoes[i].funcao.nome + ";func;" + funcoes[i].funcao.numeroChamadas + "\n" +
                                          funcoes[i].funcao.nome + ";cc;" + complexidadeCiclomatica + "\n" +
                                          funcoes[i].funcao.nome + ";halstead;" + volume + "\n" +
                                          funcoes[i].funcao.nome + ";mi;" + maintainability + "\n";
            
            infosEsprima = infosEsprima + funcoes[i].funcao.nome + ";AssignmentExpression;" + funcoes[i].funcao.numeroAssignment + "\n" +
                                          funcoes[i].funcao.nome + ";ArrayExpression;" + funcoes[i].funcao.Array + "\n" +
                                          funcoes[i].funcao.nome + ";BlockStatement;" + funcoes[i].funcao.Block + "\n" +
                                          funcoes[i].funcao.nome + ";BinaryExpression;" + funcoes[i].funcao.Binary + "\n" +
                                          funcoes[i].funcao.nome + ";BreakStatement;" + funcoes[i].funcao.Break + "\n" +
                                          funcoes[i].funcao.nome + ";CallExpression;" + funcoes[i].funcao.numeroChamadas + "\n" +
                                          funcoes[i].funcao.nome + ";CatchClause;" + funcoes[i].funcao.Catch + "\n" +
                                          funcoes[i].funcao.nome + ";ConditionalExpression;" + funcoes[i].funcao.Conditional + "\n" +
                                          funcoes[i].funcao.nome + ";ContinueStatement;" + funcoes[i].funcao.Continue + "\n" +
                                          funcoes[i].funcao.nome + ";DoWhileStatement;" + funcoes[i].funcao.numeroDoWhile + "\n" +
                                          funcoes[i].funcao.nome + ";DebuggerStatement;" + funcoes[i].funcao.Debugger + "\n" +
                                          funcoes[i].funcao.nome + ";EmptyStatement;" + funcoes[i].funcao.Empty + "\n" +
                                          funcoes[i].funcao.nome + ";ExpressionStatement;" + funcoes[i].funcao.Expression + "\n" +
                                          funcoes[i].funcao.nome + ";ForStatement;" + funcoes[i].funcao.numeroFor + "\n" +
                                          funcoes[i].funcao.nome + ";ForInStatement;" + funcoes[i].funcao.ForIn + "\n" +
                                          funcoes[i].funcao.nome + ";FunctionDeclaration;" + funcoes[i].funcao.numeroFunctionD + "\n" +
                                          funcoes[i].funcao.nome + ";FunctionExpression;" + funcoes[i].funcao.FunctionE + "\n" +
                                          funcoes[i].funcao.nome + ";Identifier;" + funcoes[i].funcao.Identifier + "\n" +
                                          funcoes[i].funcao.nome + ";IfStatement;" + funcoes[i].funcao.numeroIf + "\n" +
                                          funcoes[i].funcao.nome + ";Literal;" + funcoes[i].funcao.Literal + "\n" +
                                          funcoes[i].funcao.nome + ";LabeledStatement;" + funcoes[i].funcao.Label + "\n" +
                                          funcoes[i].funcao.nome + ";LogicalExpression;" + funcoes[i].funcao.Logical + "\n" +
                                          funcoes[i].funcao.nome + ";MemberExpression;" + funcoes[i].funcao.Member + "\n" +
                                          funcoes[i].funcao.nome + ";NewExpression;" + funcoes[i].funcao.NewExpression + "\n" +
                                          funcoes[i].funcao.nome + ";ObjectExpression;" + funcoes[i].funcao.Object + "\n" +
                                          funcoes[i].funcao.nome + ";Property;" + funcoes[i].funcao.Property + "\n" +
                                          funcoes[i].funcao.nome + ";ReturnStatement;" + funcoes[i].funcao.Return + "\n" +
                                          funcoes[i].funcao.nome + ";SequenceExpression;" + funcoes[i].funcao.Sequence + "\n" +
                                          funcoes[i].funcao.nome + ";SwitchStatement;" + funcoes[i].funcao.Switch + "\n" +
                                          funcoes[i].funcao.nome + ";SwitchCase;" + funcoes[i].funcao.numeroSwitchCase + "\n" +
                                          funcoes[i].funcao.nome + ";ThisExpression;" + funcoes[i].funcao.This + "\n" +
                                          funcoes[i].funcao.nome + ";ThrowStatement;" + funcoes[i].funcao.Throw + "\n" +
                                          funcoes[i].funcao.nome + ";TryStatement;" + funcoes[i].funcao.Try + "\n" +
                                          funcoes[i].funcao.nome + ";UnaryExpression;" + funcoes[i].funcao.Unary + "\n" +
                                          funcoes[i].funcao.nome + ";UpdateExpression;" + funcoes[i].funcao.Update + "\n" +
                                          funcoes[i].funcao.nome + ";VariableDeclaration;" + funcoes[i].funcao.numeroVariaveis + "\n" +
                                          funcoes[i].funcao.nome + ";VariableDeclarator;" + funcoes[i].funcao.numeroVariaveisD + "\n" +
                                          funcoes[i].funcao.nome + ";WhileStatement;" + funcoes[i].funcao.numeroWhile + "\n" +
                                          funcoes[i].funcao.nome + ";WithStatement;" + funcoes[i].funcao.With + "\n";
        }

        fs.writeFile("Arquivo R - Programa " + file.substr(+4) + ".txt", infosPrograma + infosFuncoes + infosEsprima, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The analyze for " + file.substr(+4) + " was saved!");
    });
}
