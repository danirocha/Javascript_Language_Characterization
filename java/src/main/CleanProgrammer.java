package main;

import java.io.File;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CleanProgrammer {
	
	private String[] regexes = {"LICENSE", ".gitignore", ".jshintrc", ".ember-cli", ".npmignore", ".bowerrc",
					".*\\.yml", ".*\\.md", ".*\\.jsx", ".*\\.json", ".*\\.html", ".*\\.ics", ".*\\.css", ".*\\.gitkeep",
					".*\\.hbs", ".*\\.txt", ".*\\.xml", ".*\\.gif", ".*\\.jpg", ".*\\.php", ".*\\.jade", ".*\\.exe", 
					".*\\.scss", ".*\\.h", ".*\\.cc", ".*\\.png", ".*\\.bin", ".*\\.java", ".*\\.cs", ".*\\.api", ".*\\.xcuser.*",
					".*\\.xcproj.*", ".*\\.ttf", ".*\\.so", ".*\\.jar", ".*\\.class", ".*\\.m", ".*\\.map", ".*\\.ft", ".*\\.py", 
					".*\\.ini", ".*\\.dust", ".*\\.styl", ".*\\.eot", ".*\\.svg", ".*\\.woff", ".*\\.xt", ".*\\.data", ".*\\.cpp", ".*\\.gyp"};
	
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
				for(int j = 0; j < regexes.length; j++) {
					Pattern pattern = Pattern.compile(regexes[j]);
					Matcher matcher = pattern.matcher(arquivo.getName());					
					
					if(matcher.find()) {
						arquivo.delete();
						System.out.println("arquivo " + arquivo + " deletado");
						arquivosDeletados++;
						break;
					}
				}
			}
		}
		
		return true;
	}

	public void printDeletedFiles() {
		
		System.out.println("Quantidade de arquivos deletados: " + arquivosDeletados);
	}
}
