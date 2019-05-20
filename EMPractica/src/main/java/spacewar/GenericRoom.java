package spacewar;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class GenericRoom {
    private List<Player> Jugadores = new ArrayList<Player>();
    private String nombre;
    private AtomicInteger numPlayers = new AtomicInteger();

    public GenericRoom(String nombre, Player player) {
        this.Jugadores.add(player);
        this.nombre=nombre;
    }

    public List<Player> getJugadores() {
        return Jugadores;
    }

    public void addJugador(Player p) {
        this.Jugadores.add(p);
    }

    public void deleteJugador(int index) {
        this.Jugadores.remove(index);
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return this.nombre;
    }
}
