package spacewar;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);

	// METHODS
	/* When someone connects to the server, this method is executed */
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception { //¿A que sala hay que añadirlo?
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("room", "lobby");
		player.setActualRoom("lobby");
		player.getSession().sendMessage(new TextMessage(msg.toString()));
		
		game.lobby.addJugador(player);
	}

	/* When a message comes, this method is executed */
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

			switch (node.get("event").asText()) {
			case "PARTIDAS":
				msg.put("event", "PARTIDAS");
				msg.put("waitRoomMap", (JsonNode) game.waitRooms);
			case "PLAYER NAME":
				player.setName(node.get("playerName").asText());
				break;
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
				
				//Crear caso create room
			case "CREATE ROOM":
				System.out.println(node.get("sala").asText());
				System.out.println(game.waitRooms.containsKey(node.get("sala").asText()));
				
				boolean aux=game.waitRooms.containsKey(node.path("sala").asText());
				if(!aux) {
					game.waitRooms.put(node.path("sala").asText(), new WaitRoom(node.path("sala").asText(),player));
					aux = true;
				} else {
					aux = false;
				}
				msg.put("event","CREATE ROOM");
				msg.put("valido", aux);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
				
			case "JOIN ROOM":
				// Mandamos la room en la que hemos entrado de vuelta al cliente 
				msg.put("event", "NEW ROOM");
				String sala_actual = player.getActualRoom();
				
				String sala_destino = node.path("room").asText();
				player.setActualRoom(sala_destino);
				msg.put("room", sala_destino);
				
				ObjectNode delete_msg = mapper.createObjectNode();
				delete_msg.put("event", "REMOVE PLAYER");
				delete_msg.put("id", player.getPlayerId());
				game.deletePlayerFromRoom(sala_actual, player, delete_msg);
				
				// Si hemos pasado de una room a una battleroom hay que ver que hacemos..
				game.addPlayerToRoom(sala_destino, player);
				
				player.getSession().sendMessage(new TextMessage(msg.toString()));
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
		String sala_actual = player.getActualRoom();
		
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		
		game.deletePlayerFromRoom(sala_actual, player, msg);
		
	}
}
