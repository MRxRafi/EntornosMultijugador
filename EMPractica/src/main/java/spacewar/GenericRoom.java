package spacewar;

import java.util.ArrayList;
import java.util.List;

public class GenericRoom {
	private List<Player> Jugadores = new ArrayList<Player>();	
	private String nombre;
	
	public GenericRoom(String nombre,Player player) {
		this.Jugadores.add(player);
		this.nombre=nombre;
	}
	
	public List<Player> getJugadores() {
		return Jugadores;
	}

	public void setJugadores(List<Player> jugadores) {
		Jugadores = jugadores;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getNombre() {
		return this.nombre;
	}
}
