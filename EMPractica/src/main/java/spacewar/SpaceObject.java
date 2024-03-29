package spacewar;

/* COMENTARIOS
 * - Clase genérica para cualquier objeto dentro del juego. Todos los objetos
 *   visibles o no dentro del juego que interactúen de alguna manera con él, 
 *   debe tener una posición, probablemente velocidad o ángulo en el que mira.
 *   Son una serie de valores que todos los objetos tienen o pueden tener.
 */

public class SpaceObject {

	// VARIABLES AND FIXED VALUES
	private int collisionFactor;
	private double posX, posY, velX, velY, facingAngle;

	// METHODS
	public double getPosX() {
		return this.posX;
	}

	public double getPosY() {
		return this.posY;
	}

	public double getFacingAngle() {
		return this.facingAngle;
	}

	public void setFacingAngle(double facingAngle) {
		this.facingAngle = facingAngle;
	}

	public void incFacingAngle(double rotSpeed) {
		this.facingAngle += rotSpeed;
	}

	public void setPosition(double x, double y) {
		this.posX = x;
		this.posY = y;
	}

	public void setVelocity(double x, double y) {
		this.velX = x;
		this.velY = y;
	}

	public void incVelocity(double velX, double velY) {
		this.velX += velX;
		this.velY += velY;
	}

	public void multVelocity(double delta) {
		this.velX *= delta;
		this.velY *= delta;
	}

	public void applyVelocity2Position() {
		this.posX += this.velX;
		this.posY += this.velY;
	}

	public int getCollisionFactor() {
		return collisionFactor;
	}

	public void setCollisionFactor(int radius) {
		this.collisionFactor = radius;
	}

	// Handle collision
	public boolean intersect(SpaceObject other) {
		int maxRadiusToCollide = this.collisionFactor + other.getCollisionFactor();
		double x = this.posX - other.getPosX();
		double y = this.posY - other.getPosY();
		return (maxRadiusToCollide > (Math.pow(x, 2) + Math.pow(y, 2)));
	}
}
