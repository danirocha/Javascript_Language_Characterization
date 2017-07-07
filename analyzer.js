var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var estraverse = require('estraverse');

var nosEsprima = ['AssignmentExpression', 'ArrayExpression', 'BlockStatement', 'BinaryExpression', 'BreakStatement',
                  'CallExpression', 'CatchClause', 'ConditionalExpression', 'ContinueStatement', 'DoWhileStatement',
                  'DebuggerStatement', 'EmptyStatement', 'ExpressionStatement', 'ForStatement', 'ForInStatement',
                  'FunctionDeclaration', 'FunctionExpression', 'Identifier', 'IfStatement', 'Literal',
                  'LabeledStatement', 'LogicalExpression', 'MemberExpression', 'NewExpression', 'ObjectExpression', 
                  'Property', 'ReturnStatement', 'SequenceExpression', 'SwitchStatement', 'SwitchCase', 
                  'ThisExpression', 'ThrowStatement', 'TryStatement', 'UnaryExpression', 'UpdateExpression', 
                  'VariableDeclaration', 'VariableDeclarator', 'WhileStatement', 'WithStatement', 'ArrayPattern',
			      'ObjectPattern', 'ArrowFunctionExpression', 'ClassExpression', 'TaggedTemplateExpression', 'Super', 
                  'MetaProperty', 'AwaitExpression', 'YieldExpression', 'ArrayPatternElement', 'AssignmentPattern',
			      'BindingPattern', 'RestElement', 'ClassBody', 'MethodDefinition', 'TemplateElement', 
                  'TemplateLiteral', 'Import', 'SpreadElement', 'ClassDeclaration', 'ForOfStatement', 
                  'ImportDeclaration', 'ImportSpecifier', 'ImportDefaultSpecifier', 'ImportNamespaceSpecifier', 'ExportAllDeclaration', 
                  'ExportDefaultDeclaration', 'ExportNamedDeclaration'];

const args = process.argv;
var nomeDiretorio = args[2];
var id = args[3];
var nomeBiblioteca = args[4].replace("/", "");
var infosBibliotecas = "";
var cabecalho = "caminho;biblioteca;nomeFuncao;analise;valor";
var funcoes = [];
var pais = [];
var funcaoAnonima = 1;
var infosBibliotecas = "";

if(fs.existsSync(".\\log analyzer.txt"))
    fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "\n\n\nAnalisando biblioteca " +  nomeBiblioteca);
else
    fs.writeFileSync(".\\log analyzer.txt", "Analisando biblioteca " +  nomeBiblioteca);


console.log("Analisando biblioteca " +  nomeBiblioteca);

lerDiretorio(nomeDiretorio, nomeBiblioteca, id);

function lerDiretorio(nomeDiretorio, nomeBiblioteca, id) {
    var arquivos = fs.readdirSync(nomeDiretorio);

    lerArquivos(nomeDiretorio, arquivos, nomeBiblioteca, id);
}

function lerArquivos(nomeDiretorio, arquivos, nomeBiblioteca, id) {
    arquivos.map(function(arquivo) {
        return path.join(nomeDiretorio, arquivo);
    }).forEach(function(arquivo) {
        var stats = fs.statSync(arquivo);
		
        if(stats.isDirectory()) {
            lerDiretorio(arquivo.toString(), nomeBiblioteca, id);
        }

        else {
				var text = fs.readFileSync(arquivo, 'utf8');
                text = text.replace(/^\uFEFF/, '');
                
                if(text.startsWith("#!")) {
                    text = text.replace('#!/usr/bin/env node', '').replace('#! /usr/bin/env node', '').replace('#!/usr/bin/env phantomjs', '');
                }

                if(fs.existsSync(".\\log analyzer.txt"))
                    fs.writeFileSync(".\\log analyzer.txt", fs.readFileSync(".\\log analyzer.txt") + "\nAnalyzing file " +  getFile(arquivo.toString(), "\\", arquivo.toString().match(/\\/gi).length));
                else
                    fs.writeFileSync(".\\log analyzer.txt", "Analyzing file " +  getFile(arquivo.toString(), "\\", arquivo.toString().match(/\\/gi).length));


                console.log("Analisando arquivo " +  getFile(arquivo.toString(), "\\", arquivo.toString().match(/\\/gi).length));

                try {
                    var syntax = esprima.parse(text, {loc: true, tokens: true, jsx: true});
					
					funcoes = [];
					pais = [];
					funcaoAnonima = 1;

					realizarParse(syntax, arquivo, nomeBiblioteca, id);
                }

                catch(err)
                {
                    try {
                        var syntax = esprima.parse(text, {loc: true, tokens: true, sourceType: 'module', jsx: true});
						
						funcoes = [];
						pais = [];
						funcaoAnonima = 1;

						realizarParse(syntax, arquivo, nomeBiblioteca, id);
                    }

                    catch(error) {

                        if(fs.existsSync(".\\arquvivos com erro.txt"))
                        {
                            var texto = fs.readFileSync(".\\arquvivos com erro.txt");

                            fs.writeFileSync(".\\arquvivos com erro.txt", texto + "\n" + nomeBiblioteca + "\t" + arquivo.toString() + "\t" + error);
                        }

                        else {
                            fs.writeFileSync(".\\arquvivos com erro.txt", nomeBiblioteca + "\t" + arquivo.toString() + "\t" + error);
                        }

                        return;
                    }
                }
            }
     });
'   '}

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

function realizarParse(ast, arquivo, nomeBiblioteca, id) {
    var totalLinhas = 0;
    var tokens = ast.tokens;

    estraverse.traverse(ast, {
        enter: function(node){
            if(node.type === "Program")
                totalLinhas = node.loc.end.line;

           if (createsNewScope(node)){
                var funcao = {nome: '', nosEsprimasValores: [], funcoesFilhas: [], linhaInicial: node.loc.start.line, linhaFinal: node.loc.end.line, colunaInicial: node.loc.start.column, colunaFinal: node.loc.end.column, operadores: [], operadoresTotal: 0, operandos: [], operandosTotal: 0};

                for(var i = 0; i < nosEsprima.length; i++)
                    funcao.nosEsprimasValores.push(0);

               if(node.id && node.id.name)
                    funcao.nome = node.id.name;
                else {
                    funcao.nome = "Função Anônima " + funcaoAnonima;
                    funcaoAnonima++;
                }

                funcoes.push(funcao);
            }

            countEsprimaNode(node);
        },

        leave: leave
    });

    for(var i = 0; i < pais.length; i++){
        var tokenInicio = 0;
        var tokenFim = 0;

        calculaOperandos(tokens, pais[i], tokenInicio, tokenFim, pais);
    }

    montaArquivoRBibliotecas(arquivo, pais, nomeBiblioteca, id, totalLinhas);
}

function createsNewScope(node){
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression'
}

function leave(node){
  if (createsNewScope(node)){
    var currentScope = funcoes.pop();

    if(funcoes.length > 0) {
        var parentScope = funcoes[funcoes.length - 1];
        parentScope.funcoesFilhas.push(currentScope);
    }

    if(funcoes.length == 0) {
        pais.push(currentScope);
    }
  }
}

function countEsprimaNode(node) {
    for(var j = 0; j < nosEsprima.length; j++) {
        if(node.type === nosEsprima[j]) {
            if(funcoes.length > 0) {
                var currentScope = funcoes[funcoes.length - 1];
                currentScope.nosEsprimasValores[j]++;
            }
        }
    }
}

function montaArquivoRBibliotecas(arquivo, pais, nomeBiblioteca, id, totalLinhas) {

        var caminhoComum = "C:\\Users\\marcio.barros\\Desktop\\dist";
        var infosPrograma = "";

        infosPrograma = arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;loc;" + totalLinhas + "\n";

        var totalDeFuncoes = 0;

        for(var i = 0; i < pais.length; i++)
            totalDeFuncoes += totalFuncoes(pais[i]);

        var totalDeVariaveis = 0;

        for(var i = 0; i < pais.length; i++)
            totalDeVariaveis += totalVariaveis(pais[i]);

        infosPrograma = infosPrograma + arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;numFunc;" + totalDeFuncoes + "\n";
        infosPrograma = infosPrograma + arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";---;variaveis;" + totalDeVariaveis + "\n";

        var infosFuncoes = "";
        var infosEsprima = "";

        for(var i = 0; i < pais.length; i++) {
            infosFuncoes += montaInfosFuncao(pais[i], arquivo, caminhoComum);
            infosEsprima += montaInfosEsprima(pais[i], arquivo, caminhoComum);
        }

        infosBibliotecas += infosPrograma + infosFuncoes + infosEsprima;
        escreveArquivo();
}

function totalFuncoes(funcao){
    if(funcao.funcoesFilhas.length == 0)
        return 1;
    
    else {
        var total = 0;

        for(var i = 0; i < funcao.funcoesFilhas.length; i++) {
            total += totalFuncoes(funcao.funcoesFilhas[i]);
        }

        return total + 1;
    }
}

function totalVariaveis(funcao){
    if(funcao.funcoesFilhas.length == 0)
        return funcao.nosEsprimasValores[35];
    
    else {
        var total = 0;

        for(var i = 0; i < funcao.funcoesFilhas.length; i++) {
            total += totalVariaveis(funcao.funcoesFilhas[i]);
        }

        return total + funcao.nosEsprimasValores[35];
    }
}

function montaInfosFuncao(funcao, arquivo, caminhoComum){
    var infosFuncoes = "";

     var volume = (funcao.operandosTotal + funcao.operadoresTotal ) * Math.log2(funcao.operadores.length + funcao.operandos.length);
     var complexidadeCiclomatica = funcao.nosEsprimasValores[18] + funcao.nosEsprimasValores[13] + funcao.nosEsprimasValores[37] + funcao.nosEsprimasValores[9] + funcao.nosEsprimasValores[29] + funcao.nosEsprimasValores[7] +1;
     var maintainability = Math.max(0, ((171 - (5.2 * Math.log(volume)) - (0.23 * (complexidadeCiclomatica)) - (16.2 * Math.log(((funcao.linhaFinal - funcao.linhaInicial) + 1))))*100) / 171);

    infosFuncoes = arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";loc;" + ((funcao.linhaFinal - funcao.linhaInicial) + 1) + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";var;" + funcao.nosEsprimasValores[35] + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";func;" + funcao.nosEsprimasValores[5] + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";dfunc;" + funcao.funcoesFilhas.length + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";cc;" + complexidadeCiclomatica + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";halstead;" + volume + "\n" +
                   arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";mi;" + maintainability + "\n";

    for(var i = 0; i < funcao.funcoesFilhas.length; i++){
        infosFuncoes += montaInfosFuncao(funcao.funcoesFilhas[i], arquivo, caminhoComum);
    }

    return infosFuncoes;
}

function montaInfosEsprima(funcao, arquivo, caminhoComum){
    var infosEsprima = "";

    for(var j = 0; j < nosEsprima.length; j++)
        infosEsprima += arquivo.toString().replace(caminhoComum, "") + ";" + nomeBiblioteca + ";" + funcao.nome + ";" + nosEsprima[j] + ";" + funcao.nosEsprimasValores[j] + "\n";

    for(var i = 0; i < funcao.funcoesFilhas.length; i++){
        infosEsprima += montaInfosEsprima(funcao.funcoesFilhas[i], arquivo, caminhoComum);
    }

    return infosEsprima;
}

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


function calculaOperandos(tokens, funcao, tokenInicio, tokenFim, pais)
{
    if(funcao.funcoesFilhas.length == 0){
        tokenInicio = 0;
        tokenFim = 0;

        for(var indexToken = 0; indexToken < tokens.length; indexToken++) {
            if(funcao.linhaInicial === tokens[indexToken].loc.start.line && funcao.colunaInicial === tokens[indexToken].loc.start.column) {
                tokenInicio = indexToken;
            }

            else if(funcao.linhaFinal === tokens[indexToken].loc.end.line && funcao.colunaFinal === tokens[indexToken].loc.end.column) {
                tokenFim = indexToken;
                break;
            }
        }

        for (var indexToken = tokenInicio; indexToken <= tokenFim; indexToken++) {
            classificaToken(indexToken, funcao, tokens);
        }

        return tokenFim + 1;
    }

    else {
        for(var j = 0; j < funcao.funcoesFilhas.length; j++){
            for(var indexToken = tokenInicio; indexToken < tokens.length; indexToken++) {
                if(funcao.linhaInicial === tokens[indexToken].loc.start.line && funcao.colunaInicial === tokens[indexToken].loc.start.column) {
                    tokenInicio = indexToken;
                }

                else if(funcao.funcoesFilhas[j].linhaInicial === tokens[indexToken].loc.start.line && funcao.funcoesFilhas[j].colunaInicial === tokens[indexToken].loc.start.column) {
                    tokenFim = indexToken;
                    break;
                }
            }

            for (var indexToken = tokenInicio; indexToken < tokenFim; indexToken++) {
                classificaToken(indexToken, funcao, tokens);
            }

            tokenInicio = calculaOperandos(tokens, funcao.funcoesFilhas[j], tokenInicio, tokenFim, pais);
        }

        if(pais.indexOf(funcao) != -1) {
            for(var indexToken = 0; indexToken < tokens.length; indexToken++) {
                if(funcao.funcoesFilhas[j-1].linhaFinal === tokens[indexToken].loc.end.line && funcao.funcoesFilhas[j-1].colunaFinal === tokens[indexToken].loc.end.column){
                    tokenInicio = indexToken;
                }

                else if(funcao.linhaFinal === tokens[indexToken].loc.end.line && funcao.colunaFinal === tokens[indexToken].loc.end.column) {
                    tokenFim = indexToken;
                    break;
                }
            }

            for (var indexToken = tokenInicio; indexToken < tokenFim; indexToken++) {
                classificaToken(indexToken, funcao, tokens);
            }
        }
    }

    return tokenInicio;
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