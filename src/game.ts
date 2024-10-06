import { Ant } from "./ant";
import { Music } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { levels } from "./levels";
import { LevelSelector } from "./levelSelector";
import { Shockwave } from "./shockwave";
import { Source } from "./source";
import { Target } from "./target";
import { none, randomAroundPoint } from "./utils";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: EntityArray<Source>;
	shockwaves: EntityArray<Shockwave>;
	levelSelector: LevelSelector;
	antValue = 0;
	shockwaveCooldown = 0;
	level = 0;

	state:
		| "levelSelect"
		| "gameStarting"
		| "game"
		| "gameover"
		| "win"
		| "pause" = "levelSelect";

	constructor() {
		super();
		this.ants = new EntityArray<Ant>();
		this.targets = new EntityArray<Target>();
		this.sources = new EntityArray<Source>();
		this.shockwaves = new EntityArray<Shockwave>();
		this.levelSelector = new LevelSelector();
		this.addChildren(
			this.ants,
			this.targets,
			this.sources,
			this.shockwaves,
			this.levelSelector,
		);
		this.addTicker((delta) => this.tick(delta));
	}

	reset() {
		this.antValue = 0;
		this.ants.clear();
		this.targets.clear();
		this.sources.clear();
		void Music.stop();
	}

	backToMainMenu() {
		this.reset();
		this.state = "levelSelect";
	}

	nextLevel() {
		this.level++;
		this.restart();
	}

	restart() {
		this.reset();
		this.startLevel(this.level);
	}

	startLevel(level: number) {
		this.level = level;
		this.state = "gameStarting";

		void Music.play({ loop: true, volume: 0.5 });

		const levelData = levels.find((l) => l.level == level);
		if (!levelData) {
			console.error("level not found");
			return;
		}

		for (const targetData of levelData.targets) {
			this.targets.add(
				new Target(
					randomAroundPoint(targetData.pos, targetData.delta),
					(target) => this.onTargetIdle(target),
				),
			);
		}

		for (const sourceData of levelData.sources) {
			this.sources.add(
				new Source(randomAroundPoint(sourceData.pos, sourceData.delta)),
			);
		}

		// Initial ants
		for (let i = 0; i < levelData.initialAnts; i++) {
			this.ants.add(new Ant());
		}
	}

	onTargetIdle(target: Target) {
		for (const ant of this.ants.entities) {
			ant.pickTarget(this.targets.entities, this.sources.entities);
		}
		this.shockwaveCooldown = 0;
		this.shockwave(target.pos.x, target.pos.y);
		this.state = "game";
	}

	carryingForce(target: Target) {
		let force = 0;
		for (const ant of this.ants.entities) {
			if (ant.state !== "carrying" || ant.target != target) {
				continue;
			}
			force += ant.level * ant.level;
		}
		return force;
	}

	healingForce(source: Source) {
		const healing = [none, 5, 15, 30];
		const destroyedFactor = 0.2;
		let force = 0;
		for (const ant of this.ants.entities) {
			if (ant.state !== "carrying" || ant.target != source) {
				continue;
			}
			force += healing[ant.level];
		}
		if (source.isDestroyed) {
			return force * destroyedFactor;
		} else {
			return force;
		}
	}

	pause() {
		if (this.state == "game") {
			this.state = "pause";
		} else {
			console.error("Cannot pause?");
		}
	}

	resume() {
		this.state = "game";
	}

	tick(delta: number) {
		if (this.state == "gameover" || this.state == "pause") {
			return;
		}

		if (this.state == "game") {
			this.antValue += delta * 2;
			for (; this.antValue >= 1; this.antValue--) {
				for (const source of this.sources.entities) {
					if (source.isDestroyed) {
						continue;
					}
					const ant = new Ant(source);
					this.ants.add(ant);
					ant.pickTarget(
						this.targets.entities,
						this.sources.entities,
					);
				}
			}
		}

		for (const target of this.targets.entities) {
			const carryingForce = this.carryingForce(target);
			target.carry(
				delta,
				carryingForce,
				this.sources.entities.filter((source) => !source.isDestroyed),
			);
		}
		for (const ant of this.ants.entities) {
			if (ant.gone) {
				this.ants.remove(ant);
			}
			ant.shockwave(delta, this.shockwaves.entities);
			ant.moveAwayIfTooClose();
			if (this.state == "game") {
				ant.pickTarget(this.targets.entities, this.sources.entities);
			}
		}

		for (const source of this.sources.entities) {
			source.shockwave(delta, this.shockwaves.entities);
			const healingForce = this.healingForce(source);
			source.heal(delta, healingForce);
		}

		for (const target of this.targets.entities) {
			target.shockwave(delta, this.shockwaves.entities);
		}

		for (const shockwave of this.shockwaves.entities) {
			if (shockwave.gone) {
				this.shockwaves.remove(shockwave);
			}
		}

		this.shockwaveCooldown -= delta;
		if (this.shockwaveCooldown < 0) {
			this.shockwaveCooldown = 0;
		}

		const gameOverTarget = this.targets.entities.find((target) =>
			target.isCloseToSource(this.sources.entities),
		);
		if (gameOverTarget) {
			gameOverTarget.disappear();
			this.gameOver();
		}
		if (
			this.ants.entities.every((ant) => ant.state == "dead") &&
			this.sources.entities.every((source) => source.isDestroyed) &&
			this.state == "game"
		) {
			this.win();
		}
	}

	gameOver() {
		this.state = "gameover";
		for (const ant of this.ants.entities) {
			ant.win();
		}
	}

	win() {
		this.state = "win";
	}

	shockwaveDelay = 0.7;
	shockwave(x: number, y: number) {
		if (this.state == "gameover" || this.state == "win") {
			return;
		}
		const strength =
			(1 - this.shockwaveCooldown / this.shockwaveDelay) ** 2;
		this.shockwaveCooldown = this.shockwaveDelay;
		this.shockwaves.add(new Shockwave({ x, y }, -300, 100, 5000, strength));
	}
}
