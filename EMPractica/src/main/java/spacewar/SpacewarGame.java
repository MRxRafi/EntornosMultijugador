package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
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
	// FIXED VALUES
	public final static SpacewarGame INSTANCE = new SpacewarGame();

	private final static int FPS = 30;
	private final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;
	
	// VARIABLES
	ObjectMapper mapper = new ObjectMapper();
	private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

	// GLOBAL GAME ROOM 
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	
	// BUILDER
	private SpacewarGame() {

	}

	// METHODS
	/* Adds a player into the players structure */
	public void addPlayer(Player player) {
		players.put(player.getSession().getId(), player);

		int count = numPlayers.getAndIncrement();
		if (count == 0) {
			this.startGameLoop();
		}
	}
	
	/* Returns a collection containing all the values from the players structure */
	public Collection<Player> getPlayers() {
		return players.values();
	}

	/* Remove a player from the players structure */
	public void removePlayer(Player player) {
		players.remove(player.getSession().getId());

		int count = this.numPlayers.decrementAndGet();
		if (count == 0) {
			this.stopGameLoop();
		}
	}

	/* Adds a projectile into the projectiles structure, indicating the ID of the
	 * player that shooted that projectile as the key */
	public void addProjectile(int id, Projectile projectile) {
		projectiles.put(id, projectile);
	}
	
	/* Returns a collection containing all the projectiles */
	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}

	/* Removes a projectile from the projectiles structure */
	public void removeProjectile(Projectile projectile) {
		players.remove(projectile.getId(), projectile);
	}

	/* Starts the Scheduled Executor, running the tick() method every TICK_DELAY milliseconds*/
	public void startGameLoop() {
		scheduler = Executors.newScheduledThreadPool(1);
		scheduler.scheduleAtFixedRate(() -> tick(), TICK_DELAY, TICK_DELAY, TimeUnit.MILLISECONDS);
	}

	/* Stops the game safetly */
	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
		}
	}

	/* Broadcasts a message to every player in the global room */
	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
			}
		}
	}

	/* A method that updates the game state */
	private void tick() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		ArrayNode arrayNodeProjectiles = mapper.createArrayNode();

		long thisInstant = System.currentTimeMillis();
		Set<Integer> bullets2Remove = new HashSet<>();
		boolean removeBullets = false;

		try {
			// Update players
			for (Player player : getPlayers()) {
				player.calculateMovement();

				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("name", player.getName());
				jsonPlayer.put("shipType", player.getShipType());
				jsonPlayer.put("posX", player.getPosX());
				jsonPlayer.put("posY", player.getPosY());
				jsonPlayer.put("facingAngle", player.getFacingAngle());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}

			// Update bullets and handle collision
			for (Projectile projectile : getProjectiles()) {
				projectile.applyVelocity2Position();

				// Handle collision
				for (Player player : getPlayers()) {
					if ((projectile.getOwner().getPlayerId() != player.getPlayerId()) && player.intersect(projectile)) {
						// System.out.println("Player " + player.getPlayerId() + " was hit!!!");
						projectile.setHit(true);
						break;
					}
				}

				ObjectNode jsonProjectile = mapper.createObjectNode();
				jsonProjectile.put("id", projectile.getId());

				if (!projectile.isHit() && projectile.isAlive(thisInstant)) {
					jsonProjectile.put("posX", projectile.getPosX());
					jsonProjectile.put("posY", projectile.getPosY());
					jsonProjectile.put("facingAngle", projectile.getFacingAngle());
					jsonProjectile.put("isAlive", true);
				} else {
					removeBullets = true;
					bullets2Remove.add(projectile.getId());
					jsonProjectile.put("isAlive", false);
					if (projectile.isHit()) {
						jsonProjectile.put("isHit", true);
						jsonProjectile.put("posX", projectile.getPosX());
						jsonProjectile.put("posY", projectile.getPosY());
					}
				}
				arrayNodeProjectiles.addPOJO(jsonProjectile);
			}

			if (removeBullets)
				this.projectiles.keySet().removeAll(bullets2Remove);

			json.put("event", "GAME STATE UPDATE");
			json.putPOJO("players", arrayNodePlayers);
			json.putPOJO("projectiles", arrayNodeProjectiles);

			this.broadcast(json.toString());
		} catch (Throwable ex) {

		}
	}

	/* I don't know why this method is here */
	public void handleCollision() {

	}
}
