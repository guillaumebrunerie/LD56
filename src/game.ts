// import { Music } from "./assets";
import { Ant } from "./ant";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { Source } from "./source";
import { Target } from "./target";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: EntityArray<Source>;
	antValue = 0;

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.targets = new EntityArray<Target>();
		this.sources = new EntityArray<Source>();
		this.addChildren(this.ants, this.targets, this.sources);
		this.addTicker((delta) => this.tick(delta));
	}

	start() {
		// void Music.play({ loop: true, volume: 0.5 });
		this.targets.add(new Target(1920 / 2, 1080 / 2));
		this.sources.add(new Source(1920 / 6, 1080 / 4));
		this.sources.add(new Source((1920 / 6) * 5, 1080 / 4));
		this.sources.add(new Source(1920 / 6, (1080 / 4) * 3));
		this.sources.add(new Source((1920 / 6) * 5, (1080 / 4) * 3));
	}

	carryingForce() {
		let force = 0;
		for (const ant of this.ants.entities) {
			if (ant.state !== "carrying") {
				continue;
			}
			force += ant.level * ant.level;
		}
		return force;
	}

	tick(delta: number) {
		this.antValue += delta * 2;
		for (; this.antValue >= 1; this.antValue--) {
			for (const source of this.sources.entities) {
				if (source.isDestroyed) {
					continue;
				}
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
			this.sources.entities.filter((source) => !source.isDestroyed),
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
