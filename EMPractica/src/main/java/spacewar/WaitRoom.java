package spacewar;

public class WaitRoom extends GenericRoom {
	
	private int IdHost;
	private boolean empezar;
	
	public WaitRoom(String nombre) {
		this.nombre = nombre;
		this.empezar = false;
	}
	
	public WaitRoom(String nombre, Player player) {
		super(nombre, player);
		// TODO Auto-generated constructor stub
		this.IdHost=player.getPlayerId();
		this.empezar = false;
	}
	
	public int getIdHost() {
		return this.IdHost;
	}
	
	public void setIdHost() {
		//if(getPlayers().size()>0)
		//	this.IdHost=getPlayers().get(0).getPlayerId();
	}

	public boolean isEmpezar() {
		return empezar;
	}

	public void setEmpezar(boolean empezar) {
		this.empezar = empezar;
	}

	public String toString() {
		
		return super.toString() + ",\"idHost\":\"" + getIdHost() +  "\",\"empezar\":\"" + isEmpezar() + "\"";  		
	}
}