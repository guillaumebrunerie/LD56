import { Music } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	sources: Point[];
	antValue = 0;

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.sources = [];
		this.addChildren(this.ants);
		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		this.antValue += delta * 2;
		for (; this.antValue >= 1; this.antValue--) {
			for (const source of this.sources) {
				this.ants.add(
					new Ant(
						source.x + Math.random() * 100 - 50,
						source.y + Math.random() * 100 - 50,
					),
				);
			}
		}
		// if (this.ants.entities.length < 50) {
		// 	for (let i = 0; i < 200; i++) {
		// 		this.ants.add(new Ant());
		// 	}
		// }
	}

	start() {
		void Music.play({ loop: true, volume: 0.5 });
		this.sources.push({ x: 1920 / 6, y: 1080 / 4 });
		this.sources.push({ x: (1920 / 6) * 5, y: 1080 / 4 });
		this.sources.push({ x: 1920 / 6, y: (1080 / 4) * 3 });
		this.sources.push({ x: (1920 / 6) * 5, y: (1080 / 4) * 3 });
		// for (let i = 0; i < 500; i++) {
		// 	this.ants.add(new Ant());
		// }
	}

	shockwave(x: number, y: number) {
		for (const ant of this.ants.entities) {
			const dx = ant.position.x - x;
			const dy = ant.position.y - y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);
			const moveDistance = Math.max(
				200 - distance / 2 + (Math.random() - 0.5) * 50,
				0,
			);
			// move back
			ant.position.x += Math.cos(angle) * moveDistance;
			ant.position.y += Math.sin(angle) * moveDistance;
			if (Math.random() * distance < 10) {
				this.ants.remove(ant);
			}
		}
	}
}

type Point = {
	x: number;
	y: number;
};

export class Ant extends Entity {
	position: Point;
	destination: Point;
	direction: number;
	speed: number;
	constructor(x: number, y: number) {
		super();
		this.position = { x, y };
		this.speed = 200;
		// destination, point towards the center
		const angle = Math.random() * Math.PI * 2;
		this.destination = {
			x: 1920 / 2 + 50 * Math.cos(angle),
			y: 1080 / 2 + 50 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.destination.y - this.position.y,
			this.destination.x - this.position.x,
		);

		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		this.direction = Math.atan2(
			this.destination.y - this.position.y,
			this.destination.x - this.position.x,
		);

		this.position.x += Math.cos(this.direction) * delta * this.speed;
		this.position.y += Math.sin(this.direction) * delta * this.speed;

		// stop at the edge
		if (this.position.x < 0) {
			this.position.x = 0;
		}
		if (this.position.x > 1920) {
			this.position.x = 1920;
		}
		if (this.position.y < 0) {
			this.position.y = 0;
		}
		if (this.position.y > 1080) {
			this.position.y = 1080;
		}

		// bounce
		// if (this.position.x < 0 || this.position.x > 1920) {
		// 	this.direction = Math.PI - this.direction;
		// }
		// if (this.position.y < 0 || this.position.y > 1080) {
		// 	this.direction = -this.direction;
		// }

		// // wrap
		// if (this.position.x < 0) {
		// 	this.position.x += 1920;
		// }
		// if (this.position.x > 1920) {
		// 	this.position.x -= 1920;
		// }
		// if (this.position.y < 0) {
		// 	this.position.y += 1080;
		// }
		// if (this.position.y > 1080) {
		// 	this.position.y -= 1080;
		// }
	}
}
