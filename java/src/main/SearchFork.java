package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SearchFork {
	
	private static final String DIRETORIO_A_SALVAR = "C:\\Users\\luisb\\Documents\\MEGA\\FACULDADE\\TCC\\Javascript_Language_Characterization";
	
	public void comecaBusca(List<Biblioteca> bibliotecas) throws IOException
	{
		BufferedWriter bw = createFile();
		int cont = 0;
		
		for(Biblioteca biblioteca : bibliotecas)
		{
			cont++;
			
			if(biblioteca.getId() == 93689)
				continue;
			
			System.out.println("Procurando forks biblioteca: " + biblioteca.getNome() + " " + cont);
			
			Pattern pattern = Pattern.compile("^https://github.com/.*");
			Matcher match = pattern.matcher(biblioteca.getGithub());
			
			if(match.find())
			{
				StringBuffer pagina = baixaPagina(biblioteca.getGithub());
				String fork = procuraFork(pagina.toString().replace("\n", "")); 
				
				if(fork.compareTo("") != 0)
					for(int i = 0; i < bibliotecas.size(); i++)
						if(bibliotecas.get(i).getGithub().compareTo(fork) == 0)
							bw.write(bibliotecas.get(i).getNome() + "\t" + biblioteca.getNome() + "\t" + "\\dist\\" + biblioteca.getId() % 1000 + "\\" + biblioteca.getGithub().substring(biblioteca.getGithub().lastIndexOf("/")) + "\n");
			}
		}
		
		bw.close();
	}

	private String procuraFork(String pagina) {
		
		Pattern pattern = Pattern.compile("<span class=\"fork-flag\">\\s*<span class=\"text\">forked from <a href=\".*\">(.*?)</a></span>\\s*</span>");
		Matcher match = pattern.matcher(pagina);
		
		if(match.find())
			return "https://github.com/" + match.group(1);
			
		return "";
	}

	private StringBuffer baixaPagina(String github) throws IOException {
		StringBuffer pagina = new StringBuffer();
		
		URL obj = new URL(github);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");
		
		int responseCode = con.getResponseCode();
		
		if(responseCode == 200)
		{
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		
			String inputLine;
	
			while ((inputLine = in.readLine()) != null) {
				pagina.append(inputLine);
			}
			
			in.close();
		}
		
		return pagina;
	}
	
	private BufferedWriter createFile() throws IOException {
		String caminhoArquivoExportacao = DIRETORIO_A_SALVAR + "\\Relatório Fork.txt";
		BufferedWriter bw = new BufferedWriter(new FileWriter(caminhoArquivoExportacao));		
		bw.write("bibliotecaOriginal\tbibliotecaFork\tpath\n");
		return bw;
	}
}
