import { Ant } from "./ant";
import { Music } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { Shockwave } from "./shockwave";
import { Source } from "./source";
import { Target } from "./target";
import { positionAwayFrom, randomAroundPoint, relativePos } from "./utils";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: EntityArray<Source>;
	shockwaves: EntityArray<Shockwave>;
	antValue = 0;
	instabilityLevel = 0;
	isGameOver = false;
	isStarting = true;
	shockwaveCooldown = 0;

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.targets = new EntityArray<Target>();
		this.sources = new EntityArray<Source>();
		this.shockwaves = new EntityArray<Shockwave>();
		this.addChildren(
			this.ants,
			this.targets,
			this.sources,
			this.shockwaves,
		);
		this.addTicker((delta) => this.tick(delta));
	}

	reset() {
		this.antValue = 0;
		this.instabilityLevel = 0;
		this.isGameOver = false;
		this.isStarting = true;
		this.ants.clear();
		this.targets.clear();
		this.sources.clear();
	}

	restart() {
		this.reset();
		this.start();
	}

	start() {
		void Music.play({ loop: true, volume: 0.5 });
		this.targets.add(
			new Target(randomAroundPoint(relativePos(0.5, 0.5), 100), () =>
				this.onTargetIdle(),
			),
		);
		this.sources.add(
			new Source(randomAroundPoint(relativePos(0.15, 0.25), 100)),
		);
		this.sources.add(
			new Source(randomAroundPoint(relativePos(0.15, 0.75), 100)),
		);
		this.sources.add(
			new Source(randomAroundPoint(relativePos(0.85, 0.75), 100)),
		);
		this.sources.add(
			new Source(randomAroundPoint(relativePos(0.85, 0.25), 100)),
		);

		// for (let i = 0; i < 5; i++) {
		// 	const position = positionAwayFrom(
		// 		this.sources.entities.map((source) => source.pos),
		// 		200,
		// 	);
		// 	if (position) {
		// 		this.sources.add(new Source(position, true));
		// 	}
		// }

		// Initial ants
		for (let i = 0; i < 50; i++) {
			this.ants.add(new Ant(null, this.targets.entities));
		}
	}

	onTargetIdle() {
		for (const ant of this.ants.entities) {
			ant.setTarget(this.targets.entities[0]);
		}
		const p = this.targets.entities[0].position;
		this.shockwave(p.x, p.y);
		this.isStarting = false;
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

		if (!this.isStarting) {
			this.antValue += delta * 2;
			for (; this.antValue >= 1; this.antValue--) {
				for (const source of this.sources.entities) {
					if (source.isDestroyed) {
						continue;
					}
					this.ants.add(new Ant(source, this.targets.entities));
				}
			}
		}

		const carryingForce = this.carryingForce;
		this.targets.entities[0].carry(
			delta,
			carryingForce,
			this.sources.entities.filter((source) => !source.isDestroyed),
		);
		// for (const ant of this.ants.entities) {
		// 	if (ant.state === "carrying") {
		// 		ant.position.x += dx;
		// 		ant.position.y += dy;
		// 	}
		// }
		for (const ant of this.ants.entities) {
			if (ant.gone) {
				this.ants.remove(ant);
			}
			ant.shockwave(delta, this.shockwaves.entities);
			ant.moveAwayIfTooClose(this.targets.entities);
		}

		for (const source of this.sources.entities) {
			source.shockwave(delta, this.shockwaves.entities);
		}

		for (const target of this.targets.entities) {
			target.shockwave(delta, this.shockwaves.entities);
		}

		for (const shockwave of this.shockwaves.entities) {
			if (shockwave.gone) {
				this.shockwaves.remove(shockwave);
			}
		}

		this.instabilityLevel -= delta / 0.3;
		if (this.instabilityLevel < 0) {
			this.instabilityLevel = 0;
		}

		this.shockwaveCooldown -= delta;
		if (this.shockwaveCooldown < 0) {
			this.shockwaveCooldown = 0;
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

	shockwaveDelay = 0.7;
	shockwave(x: number, y: number) {
		if (this.isGameOver) {
			return;
		}
		const strength =
			(1 - this.shockwaveCooldown / this.shockwaveDelay) ** 2;
		this.shockwaveCooldown = this.shockwaveDelay;
		this.shockwaves.add(
			new Shockwave({ x, y }, -300, 100, 5000, 100 * strength),
		);
		// for (const ant of this.ants.entities) {
		// 	if (ant.state === "dead") {
		// 		continue;
		// 	}
		// 	const dx = ant.position.x - x;
		// 	const dy = ant.position.y - y;
		// 	const distance = Math.sqrt(dx * dx + dy * dy);
		// 	const angle = Math.atan2(dy, dx);
		// 	const moveDistance = Math.max(
		// 		200 - distance / 2 + (Math.random() - 0.5) * 50,
		// 		0,
		// 	);
		// 	if (Math.random() * distance * ant.level < 10) {
		// 		ant.die();
		// 	} else if (Math.random() < 0.5 / ant.level) {
		// 		ant.position.x += Math.cos(angle) * moveDistance;
		// 		ant.position.y += Math.sin(angle) * moveDistance;
		// 	}
		// }
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
		const crackingSource = crackingSources[0];
		crackingSource.crack();
	}
}
