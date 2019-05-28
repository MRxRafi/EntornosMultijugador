package spacewar;

import java.util.Comparator;
import java.util.Random;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Future;

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
	private int lifePoints;
	private int score;
	private int globalScore;
	private BlockingQueue<TextMessage> messages = new ArrayBlockingQueue<TextMessage>(10);
	private Future<?> task;
	
	// BUILDER
	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.shipType = this.getRandomShipType();
		this.name = "";
		this.bullets=100;
		this.lifePoints = 10;
		this.score = 0;
		this.globalScore=0;
	}

	// METHODS
	public int getBullets() {
		return this.bullets;
	}
	
	public void setBullets(int b) {
		this.bullets=b;
	}
	
	public int getGlobalScore() {
		return this.globalScore;
	}
	
	public void setGlobalScore(int s) {
		this.globalScore=s;
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

	public int getLifePoints() {
		return lifePoints;
	}

	public void setLifePoints(int lifePoints) {
		this.lifePoints = lifePoints;
	}

	public int getScore() {
		return score;
	}
	

	public void setScore(int score) {
		this.score = score;
	}
	
	public Future<?> getTask() {
		return task;
	}

	public void setTask(Future<?> task) {
		this.task = task;
	}

	public void addMessage(TextMessage msg) {
		try {
			messages.put(msg);
		} catch (InterruptedException e) {
			System.out.println("Proceso de añadir mensaje en " + this.playerId + " interrumpido por otro proceso.");
			e.printStackTrace();
		}
	}
	
	public void manageMessages() {
		while(this.session.isOpen()) {
			try {
				TextMessage send = messages.take();
				this.session.sendMessage(send);
			} catch (Exception e) {
				System.out.println("Proceso de recoger un mensaje en " + this.playerId + " interrumpido por otro proceso.");
				//e.printStackTrace();
			}
		}
	}
	
	public String toString() {
		return "\"name\": \"" + getName() + "\", \"score\": \""+getScore()+"\"";
	}
	
	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}
}

class PlayerComparer implements Comparator <Player> {
	@Override
	  public int compare(Player p1, Player p2) {
	    // TODO: Handle null x or y values
	    int startComparison = compare(p1.getScore(),p2.getScore());
	    return startComparison;
	  }

	  // I don't know why this isn't in Long...
	  private static int compare(int a, int b) {
	    return a < b ? 1
	         : a > b ? -1
	         : 0;
	  }

}
