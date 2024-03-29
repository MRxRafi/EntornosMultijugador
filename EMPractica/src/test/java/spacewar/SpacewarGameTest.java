package spacewar;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.concurrent.CompletionService;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.BeforeClass;
import org.junit.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SpacewarGameTest {
	private ObjectMapper mapper = new ObjectMapper();
	private final boolean DEBUG = true;
	
	@BeforeClass
	public static void startServer() {
		Application.main(new String[] { "--server.port=9000" });
	}

	//@Test
	public void testConnection() throws Exception {

		WebSocketClient ws = new WebSocketClient();
		ws.connect("ws://127.0.0.1:9000/spacewar");
		ws.disconnect();
	}

	/* Test que ejecuta N hilos. Todos se unen al servidor y después se desconectan.*/
	//@Test
	public void testJoinThreads() throws Exception {
		final int NUM_CLIENTES = 4;
		
		//Semaphore sem = new Semaphore(0);
		ExecutorService executor = Executors.newFixedThreadPool(NUM_CLIENTES);
		CompletionService<String> completionService = new ExecutorCompletionService<>(executor);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			completionService.submit(()->testJoin());
		}
		
		executor.shutdown();
		executor.awaitTermination(2000, TimeUnit.MILLISECONDS);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			try {
				String msg = completionService.take().get();
				assertTrue("The fist message should contain 'join', but it is " + msg, msg.contains("JOIN"));
			} catch(ExecutionException e) {
				Throwable cause = e.getCause();
				System.out.println("Algo ha salido mal en " + cause.getMessage());
			}
			
		}
		
	}
	
	/* Test de N hilos. Test de inicio automático del juego (en caso de que MAX_PLAYERS en WaitRoom.java sea 4)*/
	//@Test
	public void testCreateAndJoinThreads() throws Exception {
		final int NUM_CLIENTES = 4;
		
		ExecutorService executor = Executors.newFixedThreadPool(NUM_CLIENTES);
		CompletionService<String> completionService = new ExecutorCompletionService<>(executor);
		CyclicBarrier join = new CyclicBarrier(NUM_CLIENTES);
		CyclicBarrier join2 = new CyclicBarrier(NUM_CLIENTES);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			completionService.submit(()->testCreateAndJoin(join, join2));
		}
		
		executor.shutdown();
		executor.awaitTermination(2000, TimeUnit.MILLISECONDS);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			try {
				String msg = completionService.take().get();
				assertTrue("The fist message should contain 'valido', but it is " + msg, msg.contains("valido"));
			} catch(ExecutionException e) {
				Throwable cause = e.getCause();
				System.out.println("Algo ha salido mal en " + cause.getMessage());
			}
			
		}
		
	}
	
	/* El test de inicio manual sería exactamente igual al automático por lo que no veo necesario realizarlo.*/
	
	/* Test de fin de juego con un jugador */
	@Test
	public void testGameOverThreads() throws Exception{
		final int NUM_CLIENTES = 2;
		
		ExecutorService executor = Executors.newFixedThreadPool(NUM_CLIENTES);
		CompletionService<String> completionService = new ExecutorCompletionService<>(executor);
		CyclicBarrier join = new CyclicBarrier(NUM_CLIENTES);
		CyclicBarrier join2 = new CyclicBarrier(NUM_CLIENTES);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			completionService.submit(()->testGameOver(join, join2));
		}
		
		executor.shutdown();
		executor.awaitTermination(2000, TimeUnit.MILLISECONDS);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			try {
				String msg = completionService.take().get();
				if(msg.contains("REMOVE PLAYER")) {
					assertTrue("The message should contain 'remove player', but it is " + msg, msg.contains("REMOVE PLAYER"));
				} else if(i == NUM_CLIENTES-1) {
					fail("The message don't contain 'remove player'");
				}
				
			} catch(ExecutionException e) {
				Throwable cause = e.getCause();
				System.out.println("Algo ha salido mal en " + cause.getMessage());
			}
		}
		
	}
	
	public String testJoin() throws Exception{
		WebSocketClient ws = new WebSocketClient();
		AtomicReference<String> message = new AtomicReference<String>();
		Semaphore sem = new Semaphore(0);
		
		/* El semáforo es necesario para que siga la ejecucion del codigo en el menor tiempo posible*/
		
		ws.onMessage((session, msg) -> {
			System.out.println("TestMessage: " + msg);
			message.compareAndSet(null, msg);
			sem.release();
		});

		ws.connect("ws://127.0.0.1:9000/spacewar");
		sem.acquire();
		System.out.println("Connected");
		
		ws.disconnect();
		return message.get();
	}
	
	public String testCreateAndJoin(CyclicBarrier join, CyclicBarrier join2) throws Exception{
		WebSocketClient ws = new WebSocketClient();
		AtomicReference<String> message = new AtomicReference<String>();
		Semaphore sem = new Semaphore(0);
		
		ws.onMessage((session, msg) -> {
			if(DEBUG) System.out.println("TestMessage: " + msg);
			message.set(null);
			message.compareAndSet(null, msg);
			sem.release();
		});
		
		ws.connect("ws://127.0.0.1:9000/spacewar");
		sem.acquire();
		if(DEBUG) System.out.println("Connected to the server");
		
		String jsonMessage = "{\"event\":\"CREATE ROOM\",\"sala\":\"sape\"}";
		ws.sendMessage(jsonMessage);
		if(DEBUG) System.out.println("Sending message CREATE ROOM..");
		sem.acquire();
		
		if(DEBUG) System.out.println("Message received. Processing..");
		if(getValueFromJson(message.get(),"valido") != "true") {  
			//Si la sala no fue válida, nos unimos, ya que alguien la
			// ha creado previamente
			if(DEBUG) System.out.println("A room was already created.. trying to join");
			jsonMessage = "{\"event\":\"JOIN ROOM\",\"room\":\"sape\"}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message JOIN ROOM..");
			sem.acquire();
			
			join.await(); //Hasta que los clientes y el host no lleguen no se sigue
			join2.await();
			//Ahora ya puedo enviar el mensaje para comenzar la partida en los clientes
			if(DEBUG) System.out.println("Attempting to join a battleRoom...");
			jsonMessage = "{\"event\":\"START GAME\",\"room\":\"sape\"}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message START GAME..");
			sem.acquire();
			
			
		} else {
			join.await(); //Hasta que los clientes y el host no lleguen no se sigue
			join.reset();
			if(DEBUG) System.out.println("A room has been created.");
			if(DEBUG) System.out.println("Attempting to Start the game.. ");
			/* En realidad este mensaje no sería necesario. El host envía, al igual que 
			 * los clientes, una petición para actualizar el número de jugadores de la sala.
			 * Esa petición es la que se encarga de comenzar la partida en caso de estar llena
			 * la sala.*/
			jsonMessage = "{\"event\":\"UPDATE NUMJUG\",\"room\":\"sape\",\"empezar\":true}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message START GAME..");
			sem.acquire();
			
			join2.await();
		}
		
		ws.disconnect();
		return message.get();
	}
	
	public String testGameOver(CyclicBarrier join, CyclicBarrier join2) throws Exception{
		WebSocketClient ws = new WebSocketClient();
		AtomicReference<String> message = new AtomicReference<String>();
		Semaphore sem = new Semaphore(0);
		
		ws.onMessage((session, msg) -> {
			System.out.println("TestMessage: " + msg);
			message.set(null);
			message.compareAndSet(null, msg);
			sem.release();
		});
		
		ws.connect("ws://127.0.0.1:9000/spacewar");
		sem.acquire();
		System.out.println("Connected");
		
		String jsonMessage = "{\"event\":\"CREATE ROOM\",\"sala\":\"sape\"}";
		ws.sendMessage(jsonMessage);
		if(DEBUG) System.out.println("Sending message CREATE ROOM..");
		sem.acquire();
		
		if(DEBUG) System.out.println("Message received. Processing..");
		if(getValueFromJson(message.get(),"valido") != "true") {  
			//User
			if(DEBUG) System.out.println("A room was already created.. trying to join");
			jsonMessage = "{\"event\":\"JOIN ROOM\",\"room\":\"sape\"}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message JOIN ROOM..");
			sem.acquire();
			join.await(); //Hasta que los clientes y el host no lleguen no se sigue
			join2.await();
			//Ahora ya puedo enviar el mensaje para comenzar la partida en los clientes
			if(DEBUG) System.out.println("Attempting to join a battleRoom...");
			jsonMessage = "{\"event\":\"START GAME\",\"room\":\"sape\"}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message START GAME..");
			
			join.await();
			Thread.currentThread().sleep(50);
			ws.disconnect();
		} else {
			//Host
			join.await(); //Hasta que los clientes y el host no lleguen no se sigue
			join.reset();
			if(DEBUG) System.out.println("A room has been created.");
			if(DEBUG) System.out.println("Attempting to Start the game.. ");
			/* En realidad este mensaje no sería necesario. El host envía, al igual que 
			 * los clientes, una petición para actualizar el número de jugadores de la sala.
			 * Esa petición es la que se encarga de comenzar la partida en caso de estar llena
			 * la sala.*/
			jsonMessage = "{\"event\":\"UPDATE NUMJUG\",\"room\":\"sape\",\"empezar\":true}";
			ws.sendMessage(jsonMessage);
			if(DEBUG) System.out.println("Sending message START GAME..");
			sem.acquire();
			
			join2.await();
			join2.reset();
			join.await();
			Thread.currentThread().sleep(200);
			ws.disconnect();
		}
		
		
		return message.get();
	}
	
	public String getValueFromJson(String json, String path) {
		String response = "";
		try {
			JsonNode node = mapper.readTree(json);
			response = node.path(path).asText();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return response;
	}
}
