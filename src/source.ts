import { Entity } from "./entities";
import type { Point } from "./utils";

export class Source extends Entity {
	pos: Point;
	healthCurrent = 100;
	healthMax = 100;
	isDestroyed = false;

	constructor(pos: Point, destroyed = false) {
		super();
		this.pos = pos;
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
		this.healthCurrent += 25;
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
