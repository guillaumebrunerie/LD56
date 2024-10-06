import { Entity } from "./entities";

import type { Shockwave } from "./shockwave";
import type { Point } from "./utils";

export class Source extends Entity {
	pos: Point;
	healthCurrent = 100;
	healthMax = 100;
	isDestroyed = false;

	radiusX = 50;
	radiusY = 50;

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

		// this.healthCurrent += 20 * delta;
		// if (this.healthCurrent > this.healthMax) {
		// 	this.healthCurrent = this.healthMax;
		// }
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

	shockwave(delta: number, shockwaves: Shockwave[]) {
		if (this.isDestroyed) {
			return;
		}
		const damage = 0.1;
		for (const shockwave of shockwaves) {
			const { strength } = shockwave.speedAt(this.pos);
			this.healthCurrent -= strength * shockwave.speed * delta * damage;
		}
		if (this.healthCurrent <= 0) {
			this.healthCurrent = 0;
			this.destroy();
		}
	}
}
