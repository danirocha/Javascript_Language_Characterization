package main;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class DeleteFiles {

	public void deleteFiles() throws IOException {
		//String caminho = "C:\\Users\\marcio.barros\\Desktop\\dist\\results";
		String caminho = "C:\\Users\\luisb\\Desktop\\novosTestes\\results";
		
		BufferedWriter bw = createTXT();
		
		procuraArquivos(caminho, bw);
		bw.close();
		
	}
	
	private static BufferedWriter createTXT() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\novosTestes\\arquivos deletados.txt";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private void procuraArquivos(String caminho, BufferedWriter bw) throws IOException {
		
		File diretorioLido = new File(caminho);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory())
				procuraArquivos(arquivo.getAbsolutePath(), bw);
			
			else {
				if(arquivo.length() == 0) {
					arquivo.delete();
					System.out.println("Deletando arquivo de análise: " + arquivo.getName() + "\n");
					bw.write("Deletando arquivo de análise: " + arquivo.getName() + "\n");
				}
			}
		}
	}
}
