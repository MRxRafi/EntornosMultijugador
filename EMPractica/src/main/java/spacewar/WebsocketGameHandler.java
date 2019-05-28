package spacewar;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/* COMENTARIOS
 * - Clase principal que maneja la llegada de mensajes de parte de
 *   los clientes. Se encarga de la comunicación en general entre
 *   cliente-servidor.
 */

public class WebsocketGameHandler extends TextWebSocketHandler {

	// VARIABLES AND FIXED VALUES
	private SpacewarGame game = SpacewarGame.INSTANCE;
	private static final String PLAYER_ATTRIBUTE = "PLAYER";

	private CopyOnWriteArraySet<String> allNames = new CopyOnWriteArraySet<String>();
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	private ExecutorService messageManager = Executors.newCachedThreadPool();
	private CopyOnWriteArrayList<Player> globalScores = new CopyOnWriteArrayList<Player>();
	
	// METHODS
	/* When someone connects to the server, this method is executed */
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception { //¿A que sala hay que añadirlo?
		Player player = new Player(playerId.incrementAndGet(), session);
		globalScores.add(player);			
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		player.setTask(messageManager.submit(()->player.manageMessages()));

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("room", "lobby");
		player.setActualRoom("lobby");
		player.addMessage(new TextMessage(msg.toString()));
		
		game.lobby.addJugador(player);
	}
	
	public String getGlobalScore(){
		int aux=0;
		String s="[{";
		for(Player p : globalScores) {
			if(aux>0)
				s+=",{";
			s+=p.toString();
			s+="}";
			aux++;
			
		}
		s+="]";
		return s;
	}
	
	public String getWaitRooms() {
		int aux=0;
		String s="[{";
		for(WaitRoom wr : game.waitRooms.values()) {
			if(aux>0)
				s+=",{";
			s+=wr.toString();
			s+="}";
			aux++;
			
		}
		s+="]";
		return s;
	}

	/* When a message comes, this method is executed */
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

			switch (node.get("event").asText()) {
			case "PLAYER NAME":
				msg.put("event","ADD NAME");
				System.out.println("a");
				System.out.println(node.get("playerName").asText());
				msg.put("playerName", node.get("playerName").asText());
				System.out.println(allNames.contains(node.get("playerName").asText()));
				synchronized (game) {
					if(allNames.contains(node.get("playerName").asText())) {
						msg.put("isAdded", false);
					}
					else {
						msg.put("isAdded", true);
						allNames.add(node.get("playerName").asText());
						player.setName(node.get("playerName").asText());
					}					
				}
				player.addMessage(new TextMessage(msg.toString()));
				break;
			case "SEND SCORE":
				player.setGlobalScore(player.getGlobalScore()+node.path("score").asInt());
				synchronized (game) {
					Collections.sort(globalScores, new PlayerComparer());
				}
			case "UPDATE GLOBAL SCORE":
				if(player.getName()!="") {
					msg.put("event","UPDATE GLOBAL SCORE");
					msg.put("globalScore", getGlobalScore());
					player.addMessage(new TextMessage(msg.toString()));
				}
				break;
				
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				player.addMessage(new TextMessage(msg.toString()));
				break;
				
			case "CREATE ROOM":
				boolean aux = true;
				synchronized(game) {
					aux=game.waitRooms.containsKey(node.path("sala").asText());
					if(!aux) {
						game.waitRooms.put(node.path("sala").asText(), new WaitRoom(node.path("sala").asText(),player));
						aux = true;
					} else {
						aux = false;
					}
				}
				msg.put("event","CREATE ROOM");
				msg.put("valido", aux);
				msg.put("sala", node.path("sala").asText());
				if(aux) player.setActualRoom(node.path("sala").asText());
				player.addMessage(new TextMessage(msg.toString()));
				break;
				
			case "PARTIDAS":
				msg.put("event", "PARTIDAS");
				msg.put("partidas", getWaitRooms());
				player.addMessage(new TextMessage(msg.toString()));
				break;
				
			case "UPDATE PARTIDAS":
				msg.put("event", "UPDATE PARTIDAS");
				msg.put("partidas", getWaitRooms());
				player.addMessage(new TextMessage(msg.toString()));
				break;
					
			case "UPDATE ACTIVE PLAYERS":
				ArrayNode arrayNodePlayers = mapper.createArrayNode();
				
				for (Player p : game.lobby.getPlayers()) {
					ObjectNode jsonPlayer = mapper.createObjectNode();
					jsonPlayer.put("id", p.getPlayerId());
					jsonPlayer.put("name", p.getName());
					arrayNodePlayers.addPOJO(jsonPlayer);
				}
				
				msg.put("event", "UPDATE ACTIVE PLAYERS");				
				msg.putPOJO("players", arrayNodePlayers);
				player.addMessage(new TextMessage(msg.toString()));
				break;
				
			case "JOIN ROOM":
				// Mandamos la room en la que hemos entrado de vuelta al cliente 
				msg.put("event", "NEW ROOM");
				String sala_actual = player.getActualRoom();
				//System.out.println(node.path("room").asText());
				String sala_destino = node.path("room").asText();
				player.setActualRoom(sala_destino);
				msg.put("room", sala_destino);
				msg.put("idHost", game.waitRooms.get(sala_destino).getIdHost());
				
				if(sala_actual != "lobby") {
					ObjectNode delete_msg = mapper.createObjectNode();
					delete_msg.put("event", "REMOVE PLAYER");
					delete_msg.put("id", player.getPlayerId());
					game.deletePlayerFromRoom(sala_actual, player, delete_msg);
				}
				
				// Si hemos pasado de una room a una battleroom hay que ver que hacemos..
				game.addPlayerToRoom(sala_destino, player);
				
				player.addMessage(new TextMessage(msg.toString()));
				break;
				
			case "UPDATE MOVEMENT":
				// Actualizar según la sala
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					game.battleRooms.get(player.getActualRoom()).addProjectile(projectile.getId(), projectile);
				}
				
				msg.put("event","UPDATE SCORE");
				//System.out.println(game.battleRooms.get(player.getActualRoom()).getScore().toString());
				msg.put("scores",game.battleRooms.get(player.getActualRoom()).getScore());
				player.addMessage(new TextMessage(msg.toString()));
				//System.out.println(game.battleRooms.get(player.getActualRoom()).getScore().toString());
				
				break;
				
			case "UPDATE NUMJUG":
				
				if(game.waitRooms.containsKey(node.get("room").asText())) {
					String room = node.get("room").asText();
					int numPlayers = game.waitRooms.get(room).getNumJugadores();
					
					msg.put("event", "UPDATE NUMJUG");
					msg.put("numJugadores", numPlayers);
					msg.put("comenzar", false);
					
					boolean cond1 = player.getPlayerId() == game.waitRooms.get(room).getIdHost();
					boolean cond2 = node.get("empezar").asBoolean();
					boolean cond3 = numPlayers == game.waitRooms.get(room).getMaxPlayers();
					
					if(cond1 && (cond2 || cond3)) {
						//Si contiene la room, creamos una battleRoom y mandamos mensaje al cliente
						game.waitRooms.get(room).setEmpezar(true);
						Map<String, Player> mp = game.waitRooms.get(room).Jugadores;
						//Ponemos la vida a 10
						for(String key : mp.keySet()) {
							mp.get(key).setLifePoints(10);
							mp.get(key).setScore(0);
						}
						//System.out.println(mp.keySet().size());
						game.battleRooms.put(room, new BattleRoom(room, game.waitRooms.get(room).Jugadores, game.scheduler));
						int nJ=game.waitRooms.get(room).getNumJugadores();
						game.battleRooms.get(room).numPlayers.set(nJ);
						game.battleRooms.get(room).startGameLoop();
						
						game.waitRooms.remove(room);
						
						msg.put("comenzar", true);
					}
					
					player.addMessage(new TextMessage(msg.toString()));
				}
				break;
					
			case "CHAT":
				msg.put("event", "CHAT");
				msg.put("playerName", node.path("playerName").asText());
				msg.put("content", node.path("content").asText());
				
				for (Map.Entry<String, Player> entry : game.lobby.Jugadores.entrySet()) {
				    entry.getValue().addMessage(new TextMessage(msg.toString()));
				}
				break;
				
			case "START GAME":
				msg.put("event", "NEW GAME");
				String room = node.get("room").asText();
				
				msg.put("response", "valido");
				msg.put("room", room);
				
				if(game.battleRooms.containsKey(room)) {
					msg.put("comenzado", true);
				} else if(!game.waitRooms.containsKey(room)){
					//Si no la contiene, mandamos un error (no debería ocurrir)
					String error = "Error al crear battleRoom. La room especificada no está en waitRooms.";
					msg.put("response", error);
				}
				
				player.addMessage(new TextMessage(msg.toString()));
				break;
					
				
			default:
				break;
			}

		} catch (Exception e) {
			System.err.println("Exception processing message " + message.getPayload());
			e.printStackTrace(System.err);
		}
	}

	/* When someone leaves the game, this method is executed */
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		player.getTask().cancel(true);

		String sala_actual = player.getActualRoom();
		ObjectNode msg = mapper.createObjectNode();

		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		
		game.deletePlayerFromRoom(sala_actual, player, msg);
		
		if(sala_actual != "lobby") {
			game.deletePlayerFromRoom("lobby", player, msg);
		}
		
	}
}
