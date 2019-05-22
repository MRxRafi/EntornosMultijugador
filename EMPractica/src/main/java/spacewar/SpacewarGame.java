package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/* COMENTARIOS
 * - Instancia principal del juego. Contiene variables de configuración y
 *   todas las variables (jugadores, proyectiles, salas, etc) del juego.
 *   También contiene los métodos para añadir, borrar y actualizar las
 *   variables del juego de sus estructuras de datos.
 */

public class SpacewarGame {
	// FIXED VALUES AND VARIABLES
	public final static SpacewarGame INSTANCE = new SpacewarGame();

	public ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
	
	// GLOBAL GAME ROOM --> lobby
	public GenericRoom lobby = new GenericRoom();
	
	// ROOMS
	public Map<String, WaitRoom> waitRooms = new ConcurrentHashMap<>();
	
	// BATTLE ROOMS
	public Map<String, BattleRoom> battleRooms = new ConcurrentHashMap<>();
	
	// BUILDER
	private SpacewarGame() {
		for (int i=0;i<89;i++) {
			waitRooms.put("wait"+i, new WaitRoom("wait"+i));
		}
		/*battleRooms.put("game", new BattleRoom("game", scheduler));
		battleRooms.get("game").startGameLoop();*/
	}

	// METHODS
	
	/* Stops the games safetly */
	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
			
		}
	}
	
	public void addPlayerToRoom(String destinyRoom, Player player) {
		if(destinyRoom == "lobby") {
			lobby.addJugador(player);
		} else if(battleRooms.containsKey(destinyRoom)) {
			battleRooms.get(destinyRoom).addJugador(player);
		} else if(waitRooms.containsKey(destinyRoom)) {
			waitRooms.get(destinyRoom).addJugador(player);
		}
		
	}
	
	public void deletePlayerFromRoom(String actualRoom, Player player, ObjectNode msg) {
		if(actualRoom == "lobby") {
			lobby.deleteJugador(player);
		} else if(battleRooms.containsKey(actualRoom)) {
			battleRooms.get(actualRoom).deleteJugador(player);
			battleRooms.get(actualRoom).broadcast(msg.toString());
		} else if(waitRooms.containsKey(actualRoom)) {
			waitRooms.get(actualRoom).deleteJugador(player);
		}
	}
}
