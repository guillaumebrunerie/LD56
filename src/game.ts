// import { Music } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";

type Point = {
	x: number;
	y: number;
};

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: Point[];
	antValue = 0;

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.targets = new EntityArray<Target>();
		this.sources = [];
		this.addChildren(this.ants);
		this.addTicker((delta) => this.tick(delta));
	}

	start() {
		// void Music.play({ loop: true, volume: 0.5 });
		this.targets.add(new Target(1920 / 2, 1080 / 2));
		this.sources.push({ x: 1920 / 6, y: 1080 / 4 });
		this.sources.push({ x: (1920 / 6) * 5, y: 1080 / 4 });
		this.sources.push({ x: 1920 / 6, y: (1080 / 4) * 3 });
		this.sources.push({ x: (1920 / 6) * 5, y: (1080 / 4) * 3 });
	}

	carryingForce() {
		return this.ants.entities.filter((ant) => ant.state === "carrying")
			.length;
	}

	tick(delta: number) {
		this.antValue += delta * 2;
		for (; this.antValue >= 1; this.antValue--) {
			for (const source of this.sources) {
				this.ants.add(
					new Ant(
						source.x + Math.random() * 100 - 50,
						source.y + Math.random() * 100 - 50,
						this.targets.entities[0],
					),
				);
			}
		}
		const carryingForce = this.carryingForce();
		const { dx, dy } = this.targets.entities[0].carry(
			delta,
			carryingForce,
			this.sources,
		);
		for (const ant of this.ants.entities) {
			if (ant.state === "carrying") {
				ant.position.x += dx;
				ant.position.y += dy;
			}
		}
		for (const ant of this.ants.entities) {
			if (ant.gone) {
				this.ants.remove(ant);
			}
		}
	}

	shockwave(x: number, y: number) {
		for (const ant of this.ants.entities) {
			if (ant.state === "dead") {
				continue;
			}
			const dx = ant.position.x - x;
			const dy = ant.position.y - y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);
			const moveDistance = Math.max(
				200 - distance / 2 + (Math.random() - 0.5) * 50,
				0,
			);
			if (Math.random() * distance < 10) {
				ant.die();
				continue;
				// this.ants.remove(ant);
			}
			// move back
			ant.position.x += Math.cos(angle) * moveDistance;
			ant.position.y += Math.sin(angle) * moveDistance;
		}
	}
}

export class Ant extends Entity {
	position: Point;
	destination: Point;
	target: Target;
	direction: number;
	speed: number;
	state: "appearing" | "walking" | "carrying" | "dead";

	constructor(x: number, y: number, target: Target) {
		super();
		this.state = "appearing";
		this.position = { x, y };
		this.speed = 200;
		this.target = target;
		// destination, point towards the center
		const angle = Math.random() * Math.PI * 2;
		this.destination = {
			x: 50 * Math.cos(angle),
			y: 50 * Math.sin(angle),
		};
		this.direction = Math.atan2(
			this.target.position.y - this.destination.y - this.position.y,
			this.target.position.x - this.destination.x - this.position.x,
		);

		this.addTicker((delta) => this.tick(delta));
	}

	tick(delta: number) {
		switch (this.state) {
			case "appearing": {
				this.appear(delta);
				return;
			}
			case "walking": {
				this.walk(delta);
				return;
			}
			case "carrying": {
				this.carry(delta);
				return;
			}
			case "dead": {
				return;
			}
		}
	}

	dieDuration = 10;

	get gone() {
		return this.state == "dead" && this.lt > this.dieDuration;
	}

	get deltas() {
		return {
			dx: this.target.position.x - this.destination.x - this.position.x,
			dy: this.target.position.y - this.destination.y - this.position.y,
		};
	}

	getDistance() {
		const { dx, dy } = this.deltas;
		return Math.sqrt(dx * dx + dy * dy);
	}

	die() {
		this.state = "dead";
		this.lt = 0;
	}

	appearDuration = 0.5;

	appear(_delta: number) {
		if (this.lt > this.appearDuration) {
			this.state = "walking";
		}
	}

	walk(delta: number) {
		const { dx, dy } = this.deltas;
		this.direction = Math.atan2(dy, dx);

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

		// carry when getting close to destination
		if (this.getDistance() < 10) {
			this.state = "carrying";
		}
	}

	carry(_delta: number) {
		if (this.getDistance() > 15) {
			this.state = "walking";
		}
	}
}

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
