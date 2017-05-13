package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class GeradorCSVArquivo {

	private int loc = 0;
	private int var = 0;
	private int numFunc = 0;
	private double tamanho = 0;
	private String nomeArquivo = "";
	private int[] esprimaValores = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
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
		//String caminho = "C:\\Users\\marcio.barros\\Desktop\\dist\\results";
		String caminho = "C:\\Users\\luisb\\Desktop\\results\\results\\1";
		
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
						
		if(nomeArquivo.compareTo(dados[0]) != 0) {
			if(nomeArquivo.compareTo("") != 0) {
				escreveDados(bw);
				loc = 0;
				var = 0;
				numFunc = 0;
				tamanho = 0;
					
				for(int h = 0; h < esprimaValores.length; h++)
					esprimaValores[h] = 0;
			}
				
			//File file = new File("C:\\Users\\marcio.barros\\Desktop\\dist" + nomeArquivo);
			File file = new File("C:\\Users\\luisb\\Documents\\ColetaDadosJavascript" + dados[0]);
			tamanho = file.length();
				
			nomeArquivo = dados[0];
		}
		
		if(dados[2].compareTo("---") == 0) {
			if(dados[3].compareTo("loc") == 0) {
				loc = Integer.parseInt(dados[4]);
			}
				
			else if(dados[3].compareTo("numFunc") == 0) {
				numFunc = Integer.parseInt(dados[4]);
			}
				
			else if(dados[3].compareTo("variaveis") == 0) {
				var = Integer.parseInt(dados[4]);
			}
		}
			
		for(int j = 0; j < esprima.length; j++) {
			String noEsprima = esprima[j];
				
			if(noEsprima.compareTo(dados[3]) == 0)
				esprimaValores[j] += Double.parseDouble(dados[4]); 
		}
	}

	private void escreveDados(BufferedWriter bw) throws IOException {
		bw.write(loc + "\t" + var + "\t" + numFunc + "\t" + tamanho + "\t");

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
		//String caminhoArquivoExportacao = "C:\\Users\\marcio.barros\\Desktop\\dist\\csv por arquivo.csv";
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\dist\\csv por arquivo.csv";
		
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		bw.write("loc\tnumVar\tnumFunc\ttamanho\t");
		
		for(int i = 0; i < esprima.length; i++) {
			if(i < esprima.length - 1)
				bw.write(esprima[i] + "\t");
			else
				bw.write(esprima[i] + "\n");
		}
		
		return bw;
	}

}
