import { Music, TargetEnd } from "./assets";
import type { Freeze } from "./freeze";
import type { Shockwave } from "./shockwave";
import type { Source } from "./source";
import { distance2, type Point } from "./utils";

const hologramDuration = 10;

export class Target {
	lt = 0;
	item: number;
	pos: Point;
	speedPerAnt = 2;
	state: "appearing" | "idle" | "disappearing" = "appearing";
	onIdle: (target: this) => void;
	isHologram: boolean;
	hologramTimeout = 0;
	gt = 0;

	radiusX = 65;
	radiusY = 57;

	constructor(
		item: number,
		pos: Point,
		onIdle: (target: Target) => void,
		hologram = false,
	) {
		this.item = item;
		this.pos = pos;
		this.onIdle = onIdle;
		this.isHologram = hologram;
		if (this.isHologram) {
			this.speedPerAnt = 0;
			this.hologramTimeout = hologramDuration;
		}
	}

	appearOffset = 1;
	appearDuration = 0.7;

	tick(delta: number) {
		this.lt += delta;
		this.gt += delta;
		this.hologramTimeout -= delta;
		if (this.hologramTimeout < 0) {
			this.hologramTimeout = 0;
		}
		switch (this.state) {
			case "appearing": {
				if (this.lt >= this.appearDuration + this.appearOffset) {
					this.setIdle();
				}
				break;
			}
			case "idle": {
				if (this.isHologram && this.hologramTimeout == 0) {
					this.state = "disappearing";
					this.lt = 0;
				}
				break;
			}
		}

		const margin = 30;
		if (this.pos.x < margin) {
			this.pos.x = margin;
		}
		if (this.pos.x > 1920 - margin) {
			this.pos.x = 1920 - margin;
		}
		if (this.pos.y < margin) {
			this.pos.y = margin;
		}
		if (this.pos.y > 1080 - margin) {
			this.pos.y = 1080 - margin;
		}
	}

	setIdle() {
		this.lt = 0;
		this.state = "idle";
		this.onIdle(this);
	}

	freezeFactor = 1 / 6;
	carry(delta: number, force: number, sources: Source[], freezes: Freeze[]) {
		if (sources.length == 0) {
			return { dx: 0, dy: 0 };
		}
		let speed = force * this.speedPerAnt;

		for (const freeze of freezes) {
			speed *= this.freezeFactor ** freeze.freezeFactor(this.pos);
		}

		const sortedSources = [...sources];
		sortedSources.sort((a, b) => {
			const distance = (source: Source) => {
				const dx = source.pos.x - this.pos.x;
				const dy = source.pos.y - this.pos.y;
				return dx * dx + dy * dy;
			};
			return distance(a) - distance(b);
		});

		let destinationIndex = 0;
		while (destinationIndex < sources.length - 1) {
			if (Math.random() < 0.7) {
				break;
			}
			destinationIndex++;
		}

		const destination = sortedSources[destinationIndex];
		const angle = Math.atan2(
			destination.pos.y - this.pos.y,
			destination.pos.x - this.pos.x,
		);
		const dx = Math.cos(angle) * speed * delta;
		const dy = Math.sin(angle) * speed * delta;
		this.pos.x += dx;
		this.pos.y += dy;
		return { dx, dy };
	}

	isCloseToSource(sources: Source[]) {
		for (const source of sources) {
			if (
				!source.isDestroyed &&
				distance2(source.pos, this.pos) < 5 * 5
			) {
				return true;
			}
		}
		return false;
	}

	shockwaveSpeed = 5;
	shockwave(delta: number, shockwaves: Shockwave[]) {
		if (this.state == "disappearing") {
			return;
		}
		for (const shockwave of shockwaves) {
			const { dx, dy } = shockwave.speedAt(this.pos, delta);

			let factor = Math.random() * this.shockwaveSpeed;
			if (shockwave.type == "push") {
				factor *= 30;
			}
			if (this.isHologram) {
				factor = 0;
			}
			this.pos.x += dx * factor;
			this.pos.y += dy * factor;
		}
	}

	disappear() {
		this.lt = 0;
		this.state = "disappearing";
		void Music.pause();
		void TargetEnd.play({ volume: 0.5 });
	}

	disappearDuration = 0.85;
}
