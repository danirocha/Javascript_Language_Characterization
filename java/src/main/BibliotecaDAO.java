package main;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class BibliotecaDAO {

	private Connection con = null;
    
	private void abrirConexao() {
	 	try {
	 		Class.forName("com.mysql.jdbc.Driver").newInstance();
            con = DriverManager.getConnection("jdbc:mysql://localhost:3306/bibliotecas_npm?autoReconnect=true&useSSL=false", "root", "root");
        }
    
	 	catch(Exception e) {
	 		return;
    	}
	}
	
	public List<Biblioteca> pegaBibliotecas() {
		try{
            abrirConexao();
                        
            String SQL = "SELECT id, name, github_url FROM packages WHERE github_url IS NOT NULL";
            
            PreparedStatement ps = con.prepareStatement(SQL);
            
            ResultSet rs = ps.executeQuery();
            
            List<Biblioteca> bibliotecas = new ArrayList<Biblioteca>();
            
            while(rs.next()) {
            	Biblioteca biblioteca = new Biblioteca();
            	
            	biblioteca.setId(rs.getInt("id"));
            	biblioteca.setNome(rs.getString("name"));
            	biblioteca.setGithub(rs.getString("github_url"));
            	
            	 bibliotecas.add(biblioteca);
            }
            
            con.close();
            return bibliotecas;
		} catch(Exception e) {
			System.out.println(e);
			return null;
		}
	}
}
