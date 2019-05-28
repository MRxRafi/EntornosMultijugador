package spacewar;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class BattleRoom extends GenericRoom {

	private final static int FPS = 30;
	private final static long TICK_DELAY = 1000 / FPS;
	private final static int worldBounds = 3000;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;
	
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private ScheduledExecutorService battleScheduler;
	private ScheduledFuture<?> task;
	private CopyOnWriteArrayList<Player> scores= new CopyOnWriteArrayList<Player>();
	
	ObjectMapper mapper = new ObjectMapper();
	
	public BattleRoom(String nombre, ScheduledExecutorService scheduler) {
		this.nombre = nombre;
		this.battleScheduler = scheduler;
	}
	
	public BattleRoom(String nombre, Map<String, Player> players, ScheduledExecutorService scheduler) {
		this.nombre = nombre;
		this.battleScheduler = scheduler;
		this.Jugadores = players;
		for(Player p : players.values()) {
			scores.add(p);
			p.setPosition(Math.random()*worldBounds, Math.random()*worldBounds);
		}
	}
	
	public String getScore(){
		int aux=0;
		String s="[{";
		for(Player p : scores) {
			if(aux>0)
				s+=",{";
			s+=p.toString();
			s+="}";
			aux++;
			
		}
		s+="]";
		return s;
	}
	
	public BattleRoom(String nombre, Player player, ScheduledExecutorService scheduler) {
		super(nombre, player);
		battleScheduler = scheduler;
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
		Jugadores.remove(projectile.getId(), projectile);
	}
	
	/* Starts the Scheduled Executor, running the tick() method every TICK_DELAY milliseconds*/
	public void startGameLoop() {
		battleScheduler = Executors.newScheduledThreadPool(1);
		task = battleScheduler.scheduleAtFixedRate(() -> tick(), TICK_DELAY, TICK_DELAY, TimeUnit.MILLISECONDS);
	}
	
	/* Stops the current task */
	public void stopTask() {
		task.cancel(false);
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
			if(this.getNumJugadores() == 0) stopTask();
			// Update players
			for (Player player : getPlayers()) {
				player.calculateMovement();
				
				double posX = player.getPosX();
				double posY = player.getPosY();
				//Ajustamos la posición a los límites del escenario
				posX = (posX+worldBounds) % worldBounds;
				posY = (posY+worldBounds) % worldBounds;
				player.setPosition(posX, posY);
				
				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("name", player.getName());
				jsonPlayer.put("shipType", player.getShipType());
				jsonPlayer.put("posX", player.getPosX());
				jsonPlayer.put("posY", player.getPosY());
				jsonPlayer.put("facingAngle", player.getFacingAngle());
				jsonPlayer.put("lifePoints", player.getLifePoints());
				jsonPlayer.put("score", player.getScore());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}

			// Handle collision and remove players when life <= 0
			Set<String> removePlayers = new HashSet<String>();
			//System.out.println(getNumJugadores());
			if(getNumJugadores()==1) {
				for(Player player : getPlayers()) {
					removePlayers.add(player.getSession().getId());
				}
			}
			for(Player player : getPlayers()) {
				if(player.getLifePoints() <= 0) removePlayers.add(player.getSession().getId());
			}
			// Remove players that don't have life points
			for(String idPlayer : removePlayers) {
				Player delPlayer = Jugadores.get(idPlayer);
				
				ObjectNode msg = mapper.createObjectNode();
				msg.put("event", "REMOVE PLAYER");
				msg.put("id", delPlayer.getPlayerId());
				numPlayers.decrementAndGet();

				this.broadcast(msg.toString());
				
				Jugadores.remove(idPlayer);
				// ¿Add players into another room like rankRoom or lobby?
				
			}
			
			// Update bullets and handle collision
			for (Projectile projectile : getProjectiles()) {
				projectile.applyVelocity2Position();

				
				for (Player player : getPlayers()) {
					if ((projectile.getOwner().getPlayerId() != player.getPlayerId()) && player.intersect(projectile)) {
						// System.out.println("Player " + player.getPlayerId() + " was hit!!!");					
						projectile.getOwner().setScore(projectile.getOwner().getScore() + 10);
						player.setLifePoints(player.getLifePoints() - 1);
						if(player.getLifePoints() <= 0){
							removePlayers.add(player.getSession().getId());
							projectile.getOwner().setScore(projectile.getOwner().getScore() + 100);
						}
						Collections.sort(scores,new PlayerComparer());
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
	
}
