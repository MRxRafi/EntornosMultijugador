package spacewar;

public class WaitRoom extends GenericRoom {
	
	private int IdHost;
	
	public WaitRoom(String nombre) {
		this.nombre = nombre;
	}
	
	public WaitRoom(String nombre, Player player) {
		super(nombre, player);
		// TODO Auto-generated constructor stub
		this.IdHost=player.getPlayerId();
	}
	
	public int getIdHost() {
		return this.IdHost;
	}
	
	public void setIdHost() {
		//if(getPlayers().size()>0)
		//	this.IdHost=getPlayers().get(0).getPlayerId();
	}
	
	
}