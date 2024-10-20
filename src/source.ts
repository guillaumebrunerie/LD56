import { SourceDestroyed } from "./assets";
import type { Freeze } from "./freeze";

import type { Shockwave } from "./shockwave";
import type { Point } from "./utils";

export class Source {
	pos: Point;
	healthMax = 100;
	healthCurrent = this.healthMax;
	isDestroyed = false;

	radiusX = 50;
	radiusY = 50;

	constructor(pos: Point, isDestroyed = false) {
		this.pos = pos;
		if (isDestroyed) {
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
			const strength = shockwave.strengthAt(this.pos, delta);
			this.healthCurrent -= strength * damage;
		}
		if (this.healthCurrent < 0) {
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
			// void SourceReopen.play({ volume: 0.5 });
		}
	}
}
