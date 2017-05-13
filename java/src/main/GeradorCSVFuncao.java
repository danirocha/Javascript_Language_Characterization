package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class GeradorCSVFuncao {
	
	String nomeFuncao = "";
	double loc = 0;
	double var = 0;
	double numChamFunc = 0;
	double halstead = 0;
	double cc = 0;
	double mi = 0;
	
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
			
			if(dados[3].compareTo("loc") == 0) {
				loc = Double.parseDouble(dados[4]);
			}
					
			else if(dados[3].compareTo("var") == 0) {
				var = Double.parseDouble(dados[4]);
			}
					
			else if(dados[3].compareTo("func") == 0) {
				numChamFunc = Double.parseDouble(dados[4]);
			}
					
			else if(dados[3].compareTo("cc") == 0) {
				cc = Double.parseDouble(dados[4]);
			}
					
			else if(dados[3].compareTo("halstead") == 0) {
				halstead = Double.parseDouble(dados[4]);
			}
					
			else if(dados[3].compareTo("mi") == 0) {
				mi = Double.parseDouble(dados[4]);
				
				escreveDados(bw);
							
				loc = 0;
				var = 0;
				numChamFunc = 0;
				cc = 0;
				halstead = 0.0;
				mi = 0.0;			
			}
		}
	}

	private void escreveDados(BufferedWriter bw) throws IOException {
		bw.write(loc + "\t" + var + "\t" + numChamFunc + "\t" + halstead + "\t" + cc + "\t" + mi + "\n");
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
		String caminhoArquivoExportacao = "C:\\Users\\marcio.barros\\Desktop\\dist\\csv por funcao.csv";
		//String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\dist\\csv por funcao.csv";
		
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		bw.write("loc\tnumVar\tnumChamFunc\thalstead\tcc\tmi\n");
				
		return bw;
	}
}
