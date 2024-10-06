import { Music, TargetEnd } from "./assets";
import { Entity } from "./entities";
import type { Shockwave } from "./shockwave";
import type { Source } from "./source";
import { distance2, type Point } from "./utils";

export class Target extends Entity {
	pos: Point;
	speedPerAnt = 2;
	state: "appearing" | "idle" | "disappearing" = "appearing";
	onIdle: (target: this) => void;

	radiusX = 65;
	radiusY = 57;

	constructor(pos: Point, onIdle: (target: Target) => void) {
		super();
		this.pos = pos;
		this.onIdle = onIdle;
		this.addTicker((delta) => this.tick(delta));
	}

	appearOffset = 0.5;
	appearDuration = 0.7;

	tick(_delta: number) {
		switch (this.state) {
			case "appearing": {
				if (this.lt >= this.appearDuration + this.appearOffset) {
					this.setIdle();
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

	carry(delta: number, force: number, sources: Source[]) {
		if (sources.length == 0) {
			return { dx: 0, dy: 0 };
		}
		const speed = force * this.speedPerAnt;

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

			const factor = Math.random() * this.shockwaveSpeed;
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
