import { Entity } from "./entities";
import type { Point } from "./utils";

export class Target extends Entity {
	position: Point;
	speedPerAnt = 1;

	constructor(x: number, y: number) {
		super();
		this.position = { x, y };
		// this.addTicker((delta) => this.tick(delta));
	}

	// tick(_delta: number) {
	// 	// nothing
	// }

	carry(delta: number, force: number, sources: Point[]) {
		const speed = force * this.speedPerAnt;
		const destination = sources[0];
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
