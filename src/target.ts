import { Entity } from "./entities";
import type { Source } from "./source";
import { distance2, type Point } from "./utils";

export class Target extends Entity {
	position: Point;
	speedPerAnt = 2;
	state: "appearing" | "idle" = "appearing";
	onIdle: () => void;

	radiusX = 65;
	radiusY = 57;

	constructor(position: Point, onIdle: () => void) {
		super();
		this.position = position;
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
		this.onIdle();
	}

	carry(delta: number, force: number, sources: Source[]) {
		if (sources.length == 0) {
			return { dx: 0, dy: 0 };
		}
		const speed = force * this.speedPerAnt;

		const sortedSources = sources.toSorted((a, b) => {
			const distance = (source: Source) => {
				const dx = source.pos.x - this.position.x;
				const dy = source.pos.y - this.position.y;
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
			destination.pos.y - this.position.y,
			destination.pos.x - this.position.x,
		);
		const dx = Math.cos(angle) * speed * delta;
		const dy = Math.sin(angle) * speed * delta;
		this.position.x += dx;
		this.position.y += dy;
		return { dx, dy };
	}

	isCloseToSource(sources: Source[]) {
		for (const source of sources) {
			if (
				!source.isDestroyed &&
				distance2(source.pos, this.position) < 5 * 5
			) {
				return true;
			}
		}
		return false;
	}
}
