package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class GeradorCSVFuncaoEsprima {
	
	private String nomeFuncao = "";
	private double[] esprimaValores = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	private final String[] esprima = {"AssignmentExpression",
			"ArrayExpression",
			"BlockStatement",
			"BinaryExpression",
			"BreakStatement",
			"CallExpression",
			"CatchClause",
			"ConditionalExpression",
			"ContinueStatement",
			"DoWhileStatement",
			"DebuggerStatement",
			"EmptyStatement",
			"ExpressionStatement",
			"ForStatement",
			"ForInStatement",
			"FunctionDeclaration",
			"FunctionExpression",
			"Identifier",
			"IfStatement",
			"Literal",
			"LabeledStatement",
			"LogicalExpression",
			"MemberExpression",
			"NewExpression",
			"ObjectExpression",
			"Property",
			"ReturnStatement",
			"SequenceExpression",
			"SwitchStatement",
			"SwitchCase",
			"ThisExpression",
			"ThrowStatement",
			"TryStatement",
			"UnaryExpression",
			"UpdateExpression",
			"VariableDeclaration",
			"VariableDeclarator",
			"WhileStatement",
			"WithStatement"
	};
	
	public void geraCSV() throws IOException {
		String caminho = "C:\\Users\\marcio.barros\\Desktop\\dist\\results";
		//String caminho = "C:\\Users\\luisb\\Desktop\\dist\\result";
		
		BufferedWriter bw = createCSV();
		
		procuraArquivos(caminho, bw);
		bw.close();
	}
	
	private void procuraArquivos(String caminho, BufferedWriter bw) throws IOException {
		
		File diretorioLido = new File(caminho);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory())
				procuraArquivos(arquivo.getAbsolutePath(), bw);
			
			else {				
				leArquivo(arquivo, bw);
			}
		}
	}

	private void analisaArquivo(String linha, BufferedWriter bw) throws IOException {
		
		String[] dados = linha.split(";");
			
		if(dados[2].compareTo("---") != 0) {
				
			if(nomeFuncao.compareTo(dados[2]) != 0)				
				nomeFuncao = dados[2];
				
			for(int j = 0; j < esprima.length; j++) {
				String noEsprima = esprima[j];
					
				if(noEsprima.compareTo(dados[3]) == 0){
					esprimaValores[j] = Double.parseDouble(dados[4]);
					
					if(j == esprima.length - 1)
					{
						escreveDados(bw);
						for(int h = 0; h < esprima.length; h++)
							esprimaValores[h] = 0;
					}
				}
			}
		}
	}
	
	private void escreveDados(BufferedWriter bw) throws IOException {
		for(int i = 0; i < esprimaValores.length; i++) {
			if(i < esprimaValores.length - 1)
				bw.write(esprimaValores[i] + "\t");
			else
				bw.write(esprimaValores[i] + "\n");
		}
	}

	private void leArquivo(File arquivo, BufferedWriter bw) throws IOException {
		FileReader arq = new FileReader(arquivo.getAbsolutePath());
	    BufferedReader lerArq = new BufferedReader(arq);
	 
	    String linha = lerArq.readLine();
	    
	    while (linha != null) {

	    	if(linha.compareTo("caminho;biblioteca;nomeFuncao;analise;valor") != 0)
	    		analisaArquivo(linha, bw);
	 
	        linha = lerArq.readLine();
	    }
	 
	    arq.close();
	}

	private BufferedWriter createCSV() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\marcio.barros\\Desktop\\dist\\csv funcao e no esprima.csv";
		//String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\dist\\csv por funcao e no esprima.csv";
		
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		
		for(int i = 0; i < esprima.length; i++) {
			if(i < esprima.length - 1)
				bw.write(esprima[i] + "\t");
			else
				bw.write(esprima[i] + "\n");
		}
		
		return bw;
	}
}
