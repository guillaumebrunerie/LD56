import { SourceDestroyed } from "./assets";
import { Entity } from "./entities";
import type { Freeze } from "./freeze";

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
		if (destroyed) {
			this.destroy();
		}
	}

	destroy() {
		if (!this.isDestroyed) {
			setTimeout(() => {
				void SourceDestroyed.play({ volume: 1 });
			}, 200);
		}
		this.isDestroyed = true;
		this.healthCurrent = 0;
	}

	shockwave(delta: number, shockwaves: Shockwave[]) {
		const damage = this.isDestroyed ? 0.05 : 0.05;
		for (const shockwave of shockwaves) {
			if (shockwave.type == "push") {
				continue;
			}
			const { strength } = shockwave.speedAt(this.pos);
			this.healthCurrent -= strength * shockwave.speed * delta * damage;
		}
		if (this.healthCurrent <= 0) {
			this.healthCurrent = 0;
			this.destroy();
		}
	}

	freezeFactor = 1 / 6;
	heal(delta: number, healingForce: number, freezes: Freeze[]) {
		for (const freeze of freezes) {
			healingForce *= this.freezeFactor ** freeze.freezeFactor(this.pos);
		}

		this.healthCurrent += healingForce * delta;
		if (this.healthCurrent > this.healthMax) {
			this.healthCurrent = this.healthMax;
			this.isDestroyed = false;
		}
	}
}
