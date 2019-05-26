package spacewar;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;

public class GenericRoom {
	protected Map<String, Player> Jugadores = new ConcurrentHashMap<String, Player>();	
	protected AtomicInteger numPlayers = new AtomicInteger(0);
	protected String nombre;
	
	public GenericRoom() { }
	
	public GenericRoom(String nombre, Player player) {
		Jugadores.put(player.getSession().getId(), player);
		numPlayers.incrementAndGet();

		this.nombre=nombre;
	}
	
	/* Returns a collection containing all the values from the players structure */
	public Collection<Player> getPlayers() {
		return Jugadores.values();
	}

	public void addJugador(Player p) {
		Jugadores.put(p.getSession().getId(), p);
		numPlayers.incrementAndGet();
	}
	
	public void deleteJugador(Player p) {
		Jugadores.remove(p.getSession().getId());
		numPlayers.decrementAndGet();
	}
	
	public int incrementNumJugadores() {
		return numPlayers.incrementAndGet();
	}
	
	public int getNumJugadores() {
		return numPlayers.get();
	}
	
	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getNombre() {
		return this.nombre;
	}
	
	public String toString() {
		
		return "\"numJug\":\"" + getNumJugadores() +"\", \"sala\":\"" + getNombre() + "\"" ;
	}
	
	/* Broadcasts a message to every player in the global room */
	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.addMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.deleteJugador(player);
			}
		}
	}
}