import { Entity } from "./entities";
import type { Source } from "./source";
import type { Point } from "./utils";

export class Target extends Entity {
	position: Point;
	speedPerAnt = 2;

	constructor(x: number, y: number) {
		super();
		this.position = { x, y };
		// this.addTicker((delta) => this.tick(delta));
	}

	// tick(_delta: number) {
	// 	// nothing
	// }

	carry(delta: number, force: number, sources: Source[]) {
		if (sources.length == 0) {
			return { dx: 0, dy: 0 };
		}
		const speed = force * this.speedPerAnt;

		const sortedSources = sources.toSorted((a, b) => {
			const distance = (source: Source) => {
				const dx = source.x - this.position.x;
				const dy = source.y - this.position.y;
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
			destination.y - this.position.y,
			destination.x - this.position.x,
		);
		const dx = Math.cos(angle) * speed * delta;
		const dy = Math.sin(angle) * speed * delta;
		this.position.x += dx;
		this.position.y += dy;
		return { dx, dy };
	}
}
