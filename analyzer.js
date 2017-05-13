var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');

const args = process.argv;

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

var dirName = args[2];

var id = args[3];

var nomeBiblioteca = args[4].replace("/", "");

var linhaFinalFuncaoPai = 0;

var infosBibliotecas = "";

var cabecalho = "caminho;biblioteca;nomeFuncao;analise;valor";

readDirectory(dirName, nomeBiblioteca, id);

function escreveArquivo() {
    var pasta = ".\\results\\" + (id%1000);

    if(!fs.existsSync(pasta)){
        fs.mkdirSync(pasta);
    };

    var arquivo = pasta + "\\" + nomeBiblioteca + " R.txt";

    if(fs.existsSync(arquivo))
    {
        fs.writeFileSync(pasta + "\\" + nomeBiblioteca + " R.txt", infosBibliotecas);
        return;
    }

    infosBibliotecas = cabecalho + "\n" + infosBibliotecas; 
    fs.writeFileSync(pasta + "\\" + nomeBiblioteca + " R.txt", infosBibliotecas);
}

function readDirectory(dirName, nomeBiblioteca, id) {
    var files = fs.readdirSync(dirName);
    
    readFiles(dirName, files, nomeBiblioteca, id);
}

function readFiles(dirName, files, nomeBiblioteca, id) {
    files.map(function(file) {
        return path.join(dirName, file);
    }).forEach(function(file) {
        var stats = fs.statSync(file);
        if(stats.isDirectory()) {
            readDirectory(file.toString(), nomeBiblioteca, id);
        }

        else {
            fs.readFile(file, function(err, logData) {

                if (err)
                    throw err;
            
                var text = logData.toString();

                if(fs.existsSync(".\\log analyzer.txt"))
                    fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "\nAnalyzing file " +  getFile(file.toString(), "\\", file.toString().match(/\\/gi).length));
                else
                    fs.writeFileSync(".\\log analyzer.txt", "Analyzing file " +  getFile(file.toString(), "\\", file.toString().match(/\\/gi).length));

                
                console.log("Analyzing file " +  getFile(file.toString(), "\\", file.toString().match(/\\/gi).length));

                esprimaParse(text, file, nomeBiblioteca, id);
                linhaFinalFuncaoPai = 0;
            });
        }
      });
}

function esprimaParse(text, file, nomeBiblioteca, id) {
    
    try
    {
        var syntax = esprima.parse(text, {
            tolerant: true,
            loc: true,
            tokens: true
        });
    }

    catch(err)
    {
        if(fs.existsSync(".\\results\\arquvivos com erro.txt"))
        {
            var texto = fs.readFileSync(".\\results\\arquvivos com erro.txt");

             fs.writeFileSync(".\\results\\arquvivos com erro.txt", texto + "\n" + file.toString() + " erro: " + err);
        }

        else {
            fs.writeFileSync(".\\results\\arquvivos com erro.txt", file.toString() + " erro: " + err);
        }

        return;
    }

    var errors = syntax.errors;
    var linhaFinalPrograma = 0;
    var funcoes = [];
    var numeroVariaveisPrograma = 0;
    var linhaFinalFuncao = 0;
    var soma = 0;
    funcoesSemNome = 1;
    
    estraverse.traverse(syntax, {
        enter: function(node) {

            procuraFuncoes(node, funcoes, syntax);

            linhaFinalPrograma = contaLinhas(node,linhaFinalPrograma);

            numeroVariaveisPrograma = numeroVariaveisPrograma + contaVariaveis(node);

        }
    });

    for(var i = 0; i < funcoes.length; i++)
        linhaFinalFuncao = contaFuncoes(funcoes[i].nodeFuncao,funcoes[i].funcao,linhaFinalFuncao, i, funcoes);

    calculaOperandos(syntax.tokens, funcoes);

    montaArquivoRBibliotecas(file, linhaFinalPrograma, funcoes, numeroVariaveisPrograma, nomeBiblioteca);
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

function funcaoExistente(objeto, funcoes) {
    for(var i = 0; i < funcoes.length; i++) {
        if(funcoes[i].nodeFuncao === objeto.nodeFuncao)
            return true;
    }

    return false;
}

function procuraFuncoes(node, funcoes, syntax)
{
    if(node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression')
    { 
        var objeto = criaObjeto(node);

        if(node.id)
            objeto.funcao.nome = node.id.name;

        else {
            objeto.funcao.nome = "Funcao Anonima " + funcoesSemNome;
            funcoesSemNome++;
        }

        objeto.nodeFuncao = node;

        if(!funcaoExistente(objeto, funcoes)) {
            funcoes.push(objeto);
            return;
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
                  operandos: [], operadores: [], funcoesFilhas: []
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


function checarFilhos(funcoes,i) {
    var j = i+1;

    while(j < funcoes.length) {
        if(funcoes[j].funcao.funcaoPai === 1) {
            if(funcoes[j].funcao.funcaoFilho === -1)
                break;
            
            else {
                if(funcoes[j].nodeFuncao.loc.end.line < funcoes[i].nodeFuncao.loc.end.line) {
                    if(!verificaFilhoExistente(j, i, funcoes)){
                        checarFilhos(funcoes, j);
                        funcoes[i].funcao.funcoesFilhas.push(j);
                    }
                }

                j++;

            }
        }

        else {
            if(funcoes[j].nodeFuncao.loc.end.line < funcoes[i].nodeFuncao.loc.end.line){
                if(!verificaFilhoExistente(j, i, funcoes))
                 funcoes[i].funcao.funcoesFilhas.push(j);
            }

                j++;
        }
    }
}

function refatoraDados(funcaoPai, funcaoFilha, escolha) {

    if(escolha === 0)
        funcaoPai.numeroAssignment = funcaoFilha.numeroAssignment;

    else if (escolha === 1)
    {
        funcaoPai.Array = funcaoPai.Array - funcaoFilha.Array;
    }

    else if(escolha === 2)
    {
        funcaoPai.Block = funcaoPai.Block - funcaoFilha.Block;
        
    }

    else if(escolha === 3)
    {
        funcaoPai.Binary = funcaoPai.Binary - funcaoFilha.Binary;
        
    }

    else if(escolha === 4)
    {
        funcaoPai.Break = funcaoPai.Break - funcaoFilha.Break;
        
    }

    else if(escolha === 5)
    {
        funcaoPai.numeroChamadas = funcaoPai.numeroChamadas - funcaoFilha.numeroChamadas;
        
    }

    else if(escolha === 6)
    {
        funcaoPai.Catch = funcaoPai.Catch - funcaoFilha.Catch;
        
    }

    else if(escolha === 7)
    {
        funcaoPai.Conditional = funcaoPai.Conditional - funcaoFilha.Conditional;
        
    }

    else if(escolha === 8)
    {
        funcaoPai.Continue = funcaoPai.Continue - funcaoFilha.Continue;
        
    }

    else if(escolha === 9)
    {
        funcaoPai.numeroDoWhile = funcaoPai.numeroDoWhile - funcaoFilha.numeroDoWhile;
        
    }

    else if(escolha === 10)
    {
        funcaoPai.Debugger = funcaoPai.Debugger - funcaoFilha.Debugger;
        
    }

    else if(escolha === 11)
    {
        funcaoPai.Empty = funcaoPai.Empty - funcaoFilha.Empty;
        
    }

    else if(escolha === 12)
    {
        funcaoPai.Expression = funcaoPai.Expression - funcaoFilha.Expression;
        
    }

    else if(escolha === 13)
    {
        funcaoPai.numeroFor = funcaoPai.numeroFor - funcaoFilha.numeroFor;
        
    }

    else if(escolha === 14)
    {
        funcaoPai.ForIn = funcaoPai.ForIn - funcaoFilha.ForIn;
        
    }

    else if(escolha === 15)
    {
        funcaoPai.numeroFunctionD = funcaoPai.numeroFunctionD - funcaoFilha.numeroFunctionD;
        
    }

    else if(escolha === 16)
    {
        funcaoPai.FunctionE = funcaoPai.FunctionE - funcaoFilha.FunctionE;
        
    }

    else if(escolha === 17)
    {
        funcaoPai.Identifier = funcaoPai.Identifier - funcaoFilha.Identifier;
        
    }

    else if(escolha === 18)
    {
        funcaoPai.numeroIf = funcaoPai.numeroIf - funcaoFilha.numeroIf;
        
    }

    else if(escolha === 19)
    {
        funcaoPai.Literal = funcaoPai.Literal - funcaoFilha.Literal;
        
    }

    else if(escolha === 20)
    {
        funcaoPai.Label = funcaoPai.Label - funcaoFilha.Label;
        
    }

    else if(escolha === 21)
    {
        funcaoPai.Logical = funcaoPai.Logical - funcaoFilha.Logical;
        
    }

    else if(escolha === 22)
    {
        funcaoPai.Member = funcaoPai.Member - funcaoFilha.Member;
        
    }

    else if(escolha === 23)
    {
        funcaoPai.NewExpression = funcaoPai.NewExpression - funcaoFilha.NewExpression;
        
    }

    else if(escolha === 24)
    {
        funcaoPai.Object = funcaoPai.Object - funcaoFilha.Object;
        
    }

    else if(escolha === 25)
    {
        funcaoPai.Property = funcaoPai.Property - funcaoFilha.Property;
        
    }

    else if(escolha === 26)
    {
        funcaoPai.Return = funcaoPai.Return - funcaoFilha.Return;
        
    }

    else if(escolha === 27)
    {
        funcaoPai.Sequence = funcaoPai.Sequence - funcaoFilha.Sequence;
        
    }

    else if(escolha === 28)
    {
        funcaoPai.Switch = funcaoPai.Switch - funcaoFilha.Switch;
        
    }

    else if(escolha === 29)
    {
        funcaoPai.numeroSwitchCase = funcaoPai.numeroSwitchCase - funcaoFilha.numeroSwitchCase;
        
    }

    else if(escolha === 30)
    {
        funcaoPai.This = funcaoPai.This - funcaoFilha.This;
        
    }

    else if(escolha === 31)
    {
        funcaoPai.Throw = funcaoPai.Throw - funcaoFilha.Throw;
        
    }

    else if(escolha === 32)
    {
        funcaoPai.Try = funcaoPai.Try - funcaoFilha.Try;
        
    }

    else if(escolha === 33)
    {
        funcaoPai.Unary = funcaoPai.Unary - funcaoFilha.Unary;
        
    }

    else if(escolha === 34)
    {
        funcaoPai.Update = funcaoPai.Update - funcaoFilha.Update;
        
    }

    else if(escolha === 35)
    {
        funcaoPai.numeroVariaveis = funcaoPai.numeroVariaveis - funcaoFilha.numeroVariaveis;
        
    }

    else if(escolha === 36)
    {
        funcaoPai.numeroVariaveisD = funcaoPai.numeroVariaveisD - funcaoFilha.numeroVariaveisD;
        
    }

    else if(escolha === 37)
    {
        funcaoPai.numeroWhile = funcaoPai.numeroWhile - funcaoFilha.numeroWhile;
        
    }

    else if(escolha === 38)
    {
        funcaoPai.With = funcaoPai.With - funcaoFilha.With;
        
    }
}

function verificaFilhoExistente(indiceFilha, indiceAtual, funcoes) {

    for(var i = 0; i < funcoes[indiceAtual].funcao.funcoesFilhas.length; i++) {
         if(funcoes[indiceAtual].funcao.funcoesFilhas[i] == indiceFilha)
                return true;

       else if(funcoes[funcoes[indiceAtual].funcao.funcoesFilhas[i]].funcao.funcoesFilhas.length > 0)
            if(verificaFilhoExistente(indiceFilha, funcoes[indiceAtual].funcao.funcoesFilhas[i], funcoes))
                return true;
    }

    return false;
}

 function contaNos(node, noEsprima, j) 
 {
     if(node.type === noEsprima)
        quantidadeNosEsprimas[j]++;
}

function getFile(s, c, n) {
  var idx;
  var i = n;
  var newS = '';
  do {
    idx = s.indexOf(c);
    newS = s.substring(idx + 1);
    s = s.substring(s.indexOf(c) + 1);
    i--;
  } while (i > 0)
  return newS;
}

 function montaArquivoRBibliotecas(file, linhaFinalPrograma, funcoes, numeroVariaveisPrograma, nomeBiblioteca, id) {
        
        var caminhoComum = "C:\\Users\\luisb\\Documents\\ColetaDadosJavascript";
        var infosPrograma = "";
        
        infosPrograma = file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;loc;" + linhaFinalPrograma + "\n" +
                        file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;numFunc;" + funcoes.length + "\n" +
                        file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;variaveis;" + numeroVariaveisPrograma + "\n";

        var infosFuncoes = "";
        var infosEsprima = "";

        for(var i = 0; i < funcoes.length; i++) {
            if(funcoes[i].funcao.funcaoPai === 1 && funcoes[i].funcao.funcaoFilho === -1)
            {
                checarFilhos(funcoes,i);

                for(var j = 0; j < 39; j++) {
                    contaFilhosInternos(funcoes[i].funcao, funcoes, j);
                }
            }                     

            var volume = (funcoes[i].funcao.operandosTotal + funcoes[i].funcao.operadoresTotal ) * Math.log2(funcoes[i].funcao.operadores.length + funcoes[i].funcao.operandos.length);
            var complexidadeCiclomatica = funcoes[i].funcao.numeroIf + funcoes[i].funcao.numeroFor + funcoes[i].funcao.numeroWhile + funcoes[i].funcao.numeroDoWhile + funcoes[i].funcao.numeroSwitchCase + funcoes[i].funcao.Conditional +1;
            var maintainability = Math.max(0, ((171 - (5.2 * Math.log(volume)) - (0.23 * (complexidadeCiclomatica)) - (16.2 * Math.log(funcoes[i].funcao.numeroLinhas)))*100) / 171);
            
            infosFuncoes = infosFuncoes + file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";loc;" + funcoes[i].funcao.numeroLinhas + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";var;" + funcoes[i].funcao.numeroVariaveisD + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";func;" + funcoes[i].funcao.numeroChamadas + "\n" +                                          
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";dfunc;" + funcoes[i].funcao.funcoesFilhas.length + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";cc;" + complexidadeCiclomatica + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";halstead;" + volume + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";mi;" + maintainability + "\n";
            
            infosEsprima = infosEsprima + file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";AssignmentExpression;" + funcoes[i].funcao.numeroAssignment + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ArrayExpression;" + funcoes[i].funcao.Array + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";BlockStatement;" + funcoes[i].funcao.Block + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";BinaryExpression;" + funcoes[i].funcao.Binary + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";BreakStatement;" + funcoes[i].funcao.Break + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";CallExpression;" + funcoes[i].funcao.numeroChamadas + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";CatchClause;" + funcoes[i].funcao.Catch + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ConditionalExpression;" + funcoes[i].funcao.Conditional + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ContinueStatement;" + funcoes[i].funcao.Continue + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";DoWhileStatement;" + funcoes[i].funcao.numeroDoWhile + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";DebuggerStatement;" + funcoes[i].funcao.Debugger + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";EmptyStatement;" + funcoes[i].funcao.Empty + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ExpressionStatement;" + funcoes[i].funcao.Expression + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ForStatement;" + funcoes[i].funcao.numeroFor + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ForInStatement;" + funcoes[i].funcao.ForIn + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";FunctionDeclaration;" + funcoes[i].funcao.numeroFunctionD + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";FunctionExpression;" + funcoes[i].funcao.FunctionE + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";Identifier;" + funcoes[i].funcao.Identifier + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";IfStatement;" + funcoes[i].funcao.numeroIf + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";Literal;" + funcoes[i].funcao.Literal + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";LabeledStatement;" + funcoes[i].funcao.Label + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";LogicalExpression;" + funcoes[i].funcao.Logical + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";MemberExpression;" + funcoes[i].funcao.Member + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";NewExpression;" + funcoes[i].funcao.NewExpression + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ObjectExpression;" + funcoes[i].funcao.Object + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";Property;" + funcoes[i].funcao.Property + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ReturnStatement;" + funcoes[i].funcao.Return + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";SequenceExpression;" + funcoes[i].funcao.Sequence + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";SwitchStatement;" + funcoes[i].funcao.Switch + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";SwitchCase;" + funcoes[i].funcao.numeroSwitchCase + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ThisExpression;" + funcoes[i].funcao.This + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";ThrowStatement;" + funcoes[i].funcao.Throw + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";TryStatement;" + funcoes[i].funcao.Try + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";UnaryExpression;" + funcoes[i].funcao.Unary + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";UpdateExpression;" + funcoes[i].funcao.Update + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";VariableDeclaration;" + funcoes[i].funcao.numeroVariaveis + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";VariableDeclarator;" + funcoes[i].funcao.numeroVariaveisD + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";WhileStatement;" + funcoes[i].funcao.numeroWhile + "\n" +
                                          file.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcoes[i].funcao.nome + ";WithStatement;" + funcoes[i].funcao.With + "\n";
        }

        infosBibliotecas = infosBibliotecas + infosPrograma + infosFuncoes + infosEsprima;
        escreveArquivo();
}

function contaFilhosInternos(funcaoPai, funcoes, escolha) {
    for(var i = 0; i < funcaoPai.funcoesFilhas.length; i++) {
        if(funcoes[funcaoPai.funcoesFilhas[i]].funcao.funcoesFilhas.length > 0){
            refatoraDados(funcaoPai, funcoes[funcaoPai.funcoesFilhas[i]].funcao, escolha);
            contaFilhosInternos(funcoes[funcaoPai.funcoesFilhas[i]].funcao, funcoes, escolha);
        }

        else
            refatoraDados(funcaoPai, funcoes[funcaoPai.funcoesFilhas[i]].funcao, escolha);
    }
}