package main;

import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CleanProgrammer {
	
	private String[] regexes = {".*\\.js$"};
	
	private int arquivosDeletados = 0;
	
	public boolean cleanDirectories(String diretorio) {
				
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++){
			
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory()) {
				cleanDirectories(arquivo.getAbsolutePath());
			}
		   
			else if (arquivo.isFile()) {
				boolean deleta = true;
				
				for(int j = 0; j < regexes.length; j++) {
					Pattern pattern = Pattern.compile(regexes[j]);
					Matcher matcher = pattern.matcher(arquivo.getName());					
					
					if(matcher.find()) {
						deleta = false;
						break;
					}
				}
				
				if(deleta)
				{
					arquivo.delete();
					System.out.println("arquivo " + arquivo + " deletado");
					arquivosDeletados++;
				}
			}
		}
		
		return true;
	}

	public void printDeletedFiles() {
		
		System.out.println("Quantidade de arquivos deletados: " + arquivosDeletados);
	}
}
