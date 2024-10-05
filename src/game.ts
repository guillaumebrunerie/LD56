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
	instabilityLevel = 0;
	isGameOver = false;

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.targets = new EntityArray<Target>();
		this.sources = new EntityArray<Source>();
		this.addChildren(this.ants, this.targets, this.sources);
		this.addTicker((delta) => this.tick(delta));
	}

	reset() {
		this.antValue = 0;
		this.instabilityLevel = 0;
		this.isGameOver = false;
		this.ants.clear();
		this.targets.clear();
		this.sources.clear();
	}

	restart() {
		this.reset();
		this.start();
	}

	start() {
		// void Music.play({ loop: true, volume: 0.5 });
		this.targets.add(new Target(1920 / 2, 1080 / 2));
		this.sources.add(new Source(1920 / 6, 1080 / 4));
		this.sources.add(new Source((1920 / 6) * 5, 1080 / 4));
		this.sources.add(new Source(1920 / 6, (1080 / 4) * 3));
		this.sources.add(new Source((1920 / 6) * 5, (1080 / 4) * 3));
		for (let i = 0; i < 5; i++) {
			this.sources.add(
				new Source(
					100 + Math.random() * (1920 - 200),
					100 + Math.random() * (1080 - 200),
					true,
				),
			);
		}
	}

	get carryingForce() {
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
		if (this.isGameOver) {
			return;
		}

		this.antValue += delta * 2;
		for (; this.antValue >= 1; this.antValue--) {
			for (const source of this.sources.entities) {
				if (source.isDestroyed) {
					continue;
				}
				this.ants.add(new Ant(source, this.targets.entities));
			}
		}
		const carryingForce = this.carryingForce;
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

		this.instabilityLevel -= delta / 0.3;
		if (this.instabilityLevel < 0) {
			this.instabilityLevel = 0;
		}
		if (this.targets.entities[0].isCloseToSource(this.sources.entities)) {
			this.gameOver();
		}
	}

	gameOver() {
		this.isGameOver = true;
		for (const ant of this.ants.entities) {
			ant.win();
		}
	}

	shockwave(x: number, y: number) {
		if (this.isGameOver) {
			return;
		}
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
			if (Math.random() * distance * ant.level < 10) {
				ant.die();
				continue;
				// this.ants.remove(ant);
			}
			// move back
			ant.position.x += Math.cos(angle) * moveDistance;
			ant.position.y += Math.sin(angle) * moveDistance;
		}
		this.instabilityLevel += 1;
		if (this.instabilityLevel >= 3) {
			this.instabilityLevel -= 3;
			this.crack();
		}
	}

	crack() {
		const crackingSources = this.sources.entities.filter(
			(source) => source.isDestroyed,
		);
		if (crackingSources.length == 0) {
			return;
		}
		const crackingSource =
			crackingSources[Math.floor(Math.random() * crackingSources.length)];
		crackingSource.crack();
	}
}
