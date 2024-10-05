import { Entity } from "./entities";

export class Source extends Entity {
	x: number;
	y: number;
	healthCurrent = 100;
	healthMax = 100;
	isDestroyed = false;

	constructor(x: number, y: number) {
		super();
		this.x = x;
		this.y = y;
		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		if (this.isDestroyed) {
			return;
		}

		this.healthCurrent += 30 * delta;
		if (this.healthCurrent > this.healthMax) {
			this.healthCurrent = this.healthMax;
		}
	}

	hit() {
		this.healthCurrent -= 20;
		if (this.healthCurrent <= 0) {
			this.healthCurrent = 0;
			this.destroy();
		}
	}

	destroy() {
		this.isDestroyed = true;
	}
}
