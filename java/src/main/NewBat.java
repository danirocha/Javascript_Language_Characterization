package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NewBat {

	public void geraBat(List<Biblioteca> bibliotecas) throws Exception {
		BufferedWriter bw = criaBat();
		String conteudo = leArquivo();
		
		procuraDiretorios("C:\\Users\\luisb\\Desktop\\MAQUINAREMOTA\\dist\\dist", conteudo, bw, bibliotecas);
		bw.close();
	}
	
	private String leArquivo() throws Exception {
		StringBuffer texto = new StringBuffer();
		FileReader fr = new FileReader("C:\\Users\\luisb\\Desktop\\testes\\arquvivos com erro sem menor e ds.txt");
		BufferedReader br = new BufferedReader(fr);
		
		String sCurrentLine;

		while ((sCurrentLine = br.readLine()) != null) {
			texto.append(sCurrentLine);
		}
		
        br.close();
		return texto.toString();
	}

	private void procuraDiretorios(String diretorio, String conteudo, BufferedWriter bw, List<Biblioteca> bibliotecas) throws Exception {
		File diretorioLido = new File(diretorio);
		
		File arquivos[] = diretorioLido.listFiles();
		
		for(int i = 0; i < arquivos.length; i++) {
			File arquivo = arquivos[i];
			
			if(arquivo.isDirectory()) {
				Pattern pattern = Pattern.compile("C:\\\\Users\\\\luisb\\\\Desktop\\\\MAQUINAREMOTA\\\\dist\\\\dist\\\\(\\d+)$");
				Matcher match = pattern.matcher(arquivo.getAbsolutePath());
				
				if(match.find()) {
					System.out.println(match.group(1));
					File libs[] = arquivo.listFiles();
					
					for(int j = 0; j < libs.length; j++) {
						if(conteudo.indexOf(libs[j].getAbsolutePath()) != -1) {
							Biblioteca biblioteca = procuraBiblioteca(libs[j], bibliotecas, Integer.parseInt(match.group(1)));
							escreveBat(bw, biblioteca, libs[j]);
						}
					}
				}
				
				else
					procuraDiretorios(arquivo.getAbsolutePath(), conteudo, bw, bibliotecas);
			}
		}
	}

	private Biblioteca procuraBiblioteca(File libs, List<Biblioteca> bibliotecas, int index) {
		Biblioteca bibliotecaAchada = null;
		
		for(Biblioteca biblioteca : bibliotecas) {
			
			if(biblioteca.getId() % 1000 != index)
				continue;
			
			String lib = libs.getAbsolutePath().substring(libs.getAbsolutePath().lastIndexOf("\\") + 1);
			Pattern pattern2 = Pattern.compile("/" + lib + "[.]*$");
			Matcher matcher = pattern2.matcher(biblioteca.getGithub());
								
			if(matcher.find()) {
				bibliotecaAchada = biblioteca;
				break;
			}
		}
		
		return bibliotecaAchada;
	}

	private void escreveBat(BufferedWriter bw, Biblioteca biblioteca, File libs) throws Exception {
		bw.write(biblioteca.getNome() + "\n");
	}

	private static BufferedWriter criaBat() throws IOException {
		String caminhoArquivoExportacao = "C:\\Users\\luisb\\Desktop\\bibliotecas com erro.txt";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));
		return bw;
	}
}
