package main;

import java.io.IOException;

public class MainProgrammer {
	
	private static final String DIRETORIO = "C:\\Users\\luisb\\Documents\\Coleta Dados Javascript\\dist";
	
	public static void main(String[] args) throws IOException {
		
		long tempoInicial = System.currentTimeMillis();
		//CleanProgrammer clean = new CleanProgrammer();
		//clean.cleanDirectories(DIRETORIO);
		//clean.printDeletedFiles();
		CSVCreator creator = new CSVCreator();
		creator.createFile(DIRETORIO);
		long tempoFinal = System.currentTimeMillis();
		System.out.println(((((tempoFinal - tempoInicial)/1000)/60)/60) + " horas");
	}

}
