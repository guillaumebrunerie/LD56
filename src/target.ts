import { Music, TargetEnd } from "./assets";
import { Entity } from "./entities";
import type { Freeze } from "./freeze";
import type { Shockwave } from "./shockwave";
import type { Source } from "./source";
import { distance2, type Point } from "./utils";

const hologramDuration = 10;

export class Target extends Entity {
	item: number;
	pos: Point;
	speedPerAnt = 2;
	state: "appearing" | "idle" | "disappearing" = "appearing";
	onIdle: (target: this) => void;
	isHologram: boolean;
	hologramTimeout = 0;

	radiusX = 65;
	radiusY = 57;

	constructor(
		item: number,
		pos: Point,
		onIdle: (target: Target) => void,
		hologram = false,
	) {
		super();
		this.item = item;
		this.pos = pos;
		this.onIdle = onIdle;
		this.isHologram = hologram;
		if (this.isHologram) {
			this.speedPerAnt = 0.2;
			this.hologramTimeout = hologramDuration;
		}
	}

	appearOffset = 0.5;
	appearDuration = 0.7;

	tick(delta: number) {
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
	}

	setIdle() {
		this.lt = 0;
		this.state = "idle";
		this.onIdle(this);
	}

	freezeFactor = 0.25;
	carry(delta: number, force: number, sources: Source[], freezes: Freeze[]) {
		if (sources.length == 0) {
			return { dx: 0, dy: 0 };
		}
		let speed = force * this.speedPerAnt;

		if (freezes.some((freeze) => freeze.containsPoint(this.pos))) {
			speed *= this.freezeFactor;
		}

		const sortedSources = sources.toSorted((a, b) => {
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
		for (const shockwave of shockwaves) {
			const { dx, dy } = shockwave.speedAt(this.pos);

			let factor = Math.random() * this.shockwaveSpeed;
			if (shockwave.type == "push") {
				factor *= 30;
			}
			if (this.isHologram) {
				factor = 0;
			}
			this.pos.x += dx * delta * factor;
			this.pos.y += dy * delta * factor;
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
