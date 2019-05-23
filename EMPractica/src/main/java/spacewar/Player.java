package spacewar;

import java.util.Random;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

/* COMENTARIOS
 * - Clase de un jugador
 */

public class Player extends Spaceship {
	
	// VARIABLES AND FIXED VALUES
	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private String name;
	private String actualRoom;
	private int bullets;
	
	// BUILDER
	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.shipType = this.getRandomShipType();
		this.name = "";
		this.bullets=100;
	}

	// METHODS
	public int getBullets() {
		return this.bullets;
	}
	
	public void setBullets(int b) {
		this.bullets=b;
	}
	
	public int getPlayerId() {
		return this.playerId;
	}

	public WebSocketSession getSession() {
		return this.session;
	}

	public void sendMessage(String msg) throws Exception {
		this.session.sendMessage(new TextMessage(msg));
	}

	public String getShipType() {
		return shipType;
	}

	public String getName() {
		return this.name;
	}
	
	public void setName(String n) {
		this.name = n;
	}
	
	public String getActualRoom() {
		return actualRoom;
	}

	public void setActualRoom(String actualRoom) {
		this.actualRoom = actualRoom;
	}

	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}
}
