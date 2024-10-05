import { Entity } from "./entities";

export class Source extends Entity {
	x: number;
	y: number;
	healthCurrent = 100;
	healthMax = 100;
	isDestroyed = false;

	constructor(x: number, y: number, destroyed = false) {
		super();
		this.x = x;
		this.y = y;
		this.addTicker((delta) => this.tick(delta));
		if (destroyed) {
			this.destroy();
		}
	}

	tick(delta: number) {
		if (this.isDestroyed) {
			return;
		}

		this.healthCurrent += 20 * delta;
		if (this.healthCurrent > this.healthMax) {
			this.healthCurrent = this.healthMax;
		}
	}

	hit() {
		if (this.isDestroyed) {
			return;
		}
		this.healthCurrent -= 15;
		if (this.healthCurrent <= 0) {
			this.healthCurrent = 0;
			this.destroy();
		}
	}

	crack() {
		this.healthCurrent += 20;
		if (this.healthCurrent > this.healthMax) {
			this.healthCurrent = this.healthMax;
			this.isDestroyed = false;
		}
	}

	destroy() {
		this.isDestroyed = true;
		this.healthCurrent = 0;
	}
}
