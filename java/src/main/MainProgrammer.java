package main;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainProgrammer {
	
	private static final String DIRETORIO = "C:\\Users\\luisb\\Documents\\ColetaDadosJavascript\\dist";
	
	public static void main(String[] args) throws IOException {
		
		//long tempoInicial = System.currentTimeMillis();
		//CleanProgrammer clean = new CleanProgrammer();
		//clean.cleanDirectories(DIRETORIO);
		//clean.printDeletedFiles();
		
		//long tempoFinal = System.currentTimeMillis();
		//System.out.println(((((tempoFinal - tempoInicial)/1000)/60)/60) + " horas");
		
		//tempoInicial = System.currentTimeMillis();
		//CSVCreator creator = new CSVCreator();
		//creator.createFile(DIRETORIO);
		//tempoFinal = System.currentTimeMillis();
		//System.out.println(((((tempoFinal - tempoInicial)/1000)/60)/60) + " horas");
				
		BufferedWriter bw = createBat();
		BufferedWriter bwLog = createLog();
		List<Biblioteca> bibliotecas = new BibliotecaDAO().pegaBibliotecas();
		
		if(bibliotecas.size() > 0)
			readDirectory(DIRETORIO, bw, bwLog, bibliotecas);
		
		bw.write("echo Analyzes done!");
		bw.close();
		bwLog.close();
		System.out.println("Bat criado!");
	}
	
	private static BufferedWriter createBat() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization\\analyzer.bat";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private static BufferedWriter createLog() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization\\log.txt";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
	
	private static void readDirectory(String diretorio, BufferedWriter bw, BufferedWriter bwLog, List<Biblioteca> bibliotecas) throws IOException {
		
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			Pattern pattern = Pattern.compile("C:/Users/luisb/Documents/ColetaDadosJavascript/dist/(\\d+)/(.*?)/");
			Matcher match = pattern.matcher(arquivo.getAbsolutePath().replace("\\", "/") + "/");
			
			if(match.find()) {
				for(Biblioteca biblioteca : bibliotecas) {
					if(biblioteca.getId() % 1000 != Integer.parseInt(match.group(1)))
						continue;
						
					Pattern pattern2 = Pattern.compile("/" + match.group(2) + "$");
					Matcher matcher = pattern2.matcher(biblioteca.getGithub());
										
					if(matcher.find()) {
						bw.write("node analyzer.js " + arquivo.getAbsolutePath() + " " + biblioteca.getId() + " " + biblioteca.getNome() + "\n");
						break;
					}
				}
			}
			
			else
				readDirectory(arquivo.getAbsolutePath(), bw, bwLog, bibliotecas);
		}
	}

}
