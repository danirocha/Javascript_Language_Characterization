package main;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FilenameUtils;

public class CSVCreator {

	private static final String DIRETORIO_A_SALVAR = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization";
	
	private String nomeBiblioteca = "";
	
	private int numeroBibliotecas = 0;
	
	private int numeroArquivosLidos = 0;
	
	public void createFile(String diretorio) throws IOException {
		
		BufferedWriter bw = createCSV();
		readDirectory(diretorio, bw);
		bw.close();
		
		System.out.println("Numero de bibliotecas lidas: " + numeroBibliotecas);
		System.out.println("Numero de arquivos lidos: " + numeroArquivosLidos);
	}

	private BufferedWriter createCSV() throws IOException {
		String caminhoArquivoExportacao = DIRETORIO_A_SALVAR + "\\Relatório Arquivos.csv";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));		
		bw.write("nome do arquivo\tnome da biblioteca\tpath do arquivo\textensao do arquivo\ttamanho bytes\n");
		return bw;
	}

	private void readDirectory(String diretorio, BufferedWriter bw) throws IOException {
		
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory()) {
				Pattern pattern = Pattern.compile("C:/Users/luisb/Documents/Coleta Dados Javascript/dist/\\d+/(.*?)/");
				Matcher match = pattern.matcher(arquivo.getAbsolutePath().replace("\\", "/") + "/");
				
				if(match.find()) {
					if(nomeBiblioteca.compareTo(match.group(1)) != 0) {
						nomeBiblioteca = match.group(1);
						System.out.println("Lendo arquivos biblioteca: " + nomeBiblioteca);
						numeroBibliotecas++;
					}
				}
				
				readDirectory(arquivo.getAbsolutePath(), bw);		
			}
			
			else if(arquivo.isFile()) {
				String extensao = FilenameUtils.getExtension(arquivo.getName());
				String nome = arquivo.getName().replace("." + extensao, "");
				long tamanho = arquivo.length();
				
				bw.write(nome + "\t" + nomeBiblioteca + "\t" + arquivo.getAbsolutePath() + "\t" + extensao + "\t" + tamanho + "\n");
				numeroArquivosLidos++;
			}
		}
	}
}
