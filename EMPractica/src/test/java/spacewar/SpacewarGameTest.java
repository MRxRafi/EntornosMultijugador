package spacewar;

import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.BeforeClass;
import org.junit.Test;

public class SpacewarGameTest {

	@BeforeClass
	public static void startServer() {
		Application.main(new String[] { "--server.port=9000" });
	}

	@Test
	public void testConnection() throws Exception {

		WebSocketClient ws = new WebSocketClient();
		ws.connect("ws://127.0.0.1:9000/spacewar");
		ws.disconnect();
	}

	@Test
	public void testJoinThreads() throws Exception {
		final int NUM_CLIENTES = 4;
		
		//Semaphore sem = new Semaphore(0);
		ExecutorService executor = Executors.newFixedThreadPool(NUM_CLIENTES);
		CompletionService<String> completionService = new ExecutorCompletionService<>(executor);
		
		for(int i = 0; i < NUM_CLIENTES; i++) {
			completionService.submit(()->testJoin());
		}
		
		executor.shutdown();
		executor.awaitTermination(200, TimeUnit.MILLISECONDS);
		
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
	
	public String testJoin() throws Exception{
		WebSocketClient ws = new WebSocketClient();
		AtomicReference<String> message = new AtomicReference<String>();
		Semaphore sem = new Semaphore(0);
		
		/* El lock es necesario para que siga la ejecucion del codigo en el menor tiempo posible*/
		
		ws.onMessage((session, msg) -> {
			System.out.println("TestMessage: " + msg);
			message.compareAndSet(null, msg);
			sem.release();
		});

		ws.connect("ws://127.0.0.1:9000/spacewar");
		sem.acquire();
		System.out.println("Connected");
		
		String jsonMessage = "{\"event\":\"CREATE ROOM\",\"sala\":\"sape\"}";
		ws.sendMessage(jsonMessage);
		System.out.println("Sending message CREATE ROOM..");
		sem.acquire();
		
		
		ws.disconnect();
		return message.get();
	}
}
