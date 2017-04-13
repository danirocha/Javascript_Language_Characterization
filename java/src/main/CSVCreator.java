package main;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CSVCreator {

	private static final String DIRETORIO_A_SALVAR = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization";
	private static final String CAMINHO_COMUM = "C:\\Users\\luisb\\Documents\\ColetaDadosJavascript\\";
	
	private String nomeBiblioteca = "";
	
	private int numeroBibliotecas = 0;
	
	private int numeroArquivosLidos = 0;
	
	public void createFile(String diretorio, List<Biblioteca> bibliotecas, String[] bibliotecasRejeitar) throws IOException {
		
		BufferedWriter bw = createCSV();
		readDirectory(diretorio, bw, bibliotecas, bibliotecasRejeitar);
		bw.close();
		
		System.out.println("Numero de bibliotecas lidas: " + numeroBibliotecas);
		System.out.println("Numero de arquivos lidos: " + numeroArquivosLidos);
	}

	private BufferedWriter createCSV() throws IOException {
		String caminhoArquivoExportacao = DIRETORIO_A_SALVAR + "\\Relatório Arquivos.csv";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));		
		bw.write("arquivo\tbiblioteca\tpath\ttamanho\n");
		return bw;
	}

	private void readDirectory(String diretorio, BufferedWriter bw, List<Biblioteca> bibliotecas, String[] bibliotecasRejeitar) throws IOException {
		
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory()) {
				Pattern pattern = Pattern.compile("C:\\\\Users\\\\luisb\\\\Documents\\\\ColetaDadosJavascript\\\\dist\\\\(\\d+)\\\\(.*?)\\\\");
				Matcher match = pattern.matcher(arquivo.getAbsolutePath() + "\\");
				
				if(match.find()) {					
					for(Biblioteca biblioteca : bibliotecas) {
						if(biblioteca.getId() % 1000 != Integer.parseInt(match.group(1)))
							continue;
						
						Pattern pattern2 = Pattern.compile("/" + match.group(2) + "[.]*$");
						Matcher matcher = pattern2.matcher(biblioteca.getGithub());
											
						if(matcher.find()) {
							nomeBiblioteca = biblioteca.getNome();
							System.out.println("Lendo arquivos biblioteca: " + nomeBiblioteca);
							numeroBibliotecas++;
							break;
						}
					}
				}
				
				readDirectory(arquivo.getAbsolutePath(), bw, bibliotecas, bibliotecasRejeitar);		
			}
			
			else if(arquivo.isFile()) {
				
				boolean achou = false;
				
				for(int indiceRejeitada = 0; indiceRejeitada < bibliotecasRejeitar.length; indiceRejeitada++) {
					if(bibliotecasRejeitar[indiceRejeitada].compareToIgnoreCase(nomeBiblioteca) == 0) {
						achou = true; break;
					}
				}
				
				if(!achou) {
					String path = arquivo.getAbsolutePath().replace(CAMINHO_COMUM, "").replace("'", "").replace("#", "");
					int lastIndex = path.lastIndexOf("\\");
					String nome = arquivo.getName().replace(".js", "");
					long tamanho = arquivo.length();
					
					bw.write(nome + "\t" + nomeBiblioteca + "\t" + path.substring(0, lastIndex) + "\t" + tamanho + "\n");
					numeroArquivosLidos++;
				}
			}
		}
	}
}
