package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class GeradorCSVBiblioteca {
	
	private String nomeBiblioteca = "";
	private int numeroArquivos = 0;
	private int loc = 0;
	private int var = 0;
	private int numFunc = 0;
	private double tamanho = 0;
	private String nomeArquivo = "";
	
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
				nomeBiblioteca = "";
				numeroArquivos = 0;
				loc = 0;
				var = 0;
				numFunc = 0;
				tamanho = 0;
				nomeArquivo = "";
				
				leArquivo(arquivo, bw);
			}
		}
	}

	private void analisaArquivo(String linha, BufferedWriter bw) throws IOException {
		
		String[] dados = linha.split(";");
			
		if(nomeBiblioteca.compareTo(dados[1]) != 0) {
			nomeBiblioteca = dados[1];
		}
			
		if(nomeArquivo.compareTo(dados[0]) != 0) {
			nomeArquivo = dados[0];
				numeroArquivos++;
				
			File file = new File("C:\\Users\\marcio.barros\\Desktop\\dist" + nomeArquivo);
			//File file = new File("C:\\Users\\luisb\\Documents\\ColetaDadosJavascript" + nomeArquivo);
			tamanho = tamanho + file.length();
		}
			
		if(dados[2].compareTo("---") == 0) {
			if(dados[3].compareTo("loc") == 0) {
				loc = loc + Integer.parseInt(dados[4]);
			}
			
			else if(dados[3].compareTo("numFunc") == 0) {
				numFunc = numFunc + Integer.parseInt(dados[4]);
			}
			
			else if(dados[3].compareTo("variaveis") == 0) {
				var = var + Integer.parseInt(dados[4]);
			}
		}
	}

	private void escreveDados(BufferedWriter bw) throws IOException {
		bw.write(nomeBiblioteca + "\t" + numeroArquivos + "\t" + loc + "\t" + var + "\t" + numFunc + "\t" + tamanho + "\n");
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
	    escreveDados(bw);
	}

	private static BufferedWriter createCSV() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\marcio.barros\\Desktop\\dist\\csv por biblioteca.csv";
		//String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\dist\\csv por biblioteca.csv";
		
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		bw.write("nomeBiblioteca\tnumArquivos\tloc\tnumVar\tnumFunc\ttamanho\n");
		return bw;
	}
}
