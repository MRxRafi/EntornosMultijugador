package spacewar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/* COMENTARIOS
 * - Clase que inicia el servidor websockets
 */

@SpringBootApplication
@EnableWebSocket
public class Application implements WebSocketConfigurer {
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(gameHandler(), "/spacewar");
	}

	@Bean
	public WebsocketGameHandler gameHandler() {
		return new WebsocketGameHandler();
	}
}