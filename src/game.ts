import { Ant } from "./ant";
import { Music } from "./assets";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { levels } from "./levels";
import { LevelSelector } from "./levelSelector";
import { Shockwave } from "./shockwave";
import { Source } from "./source";
import { Target } from "./target";
import { closest, randomAroundPoint } from "./utils";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: EntityArray<Source>;
	shockwaves: EntityArray<Shockwave>;
	levelSelector: LevelSelector;
	antValue = 0;
	instabilityLevel = 0;
	isGameOver = false;
	isStarting = true;
	shockwaveCooldown = 0;
	screen: "levelSelect" | "game" = "levelSelect";
	level = 0;

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
		this.instabilityLevel = 0;
		this.isGameOver = false;
		this.isStarting = true;
		this.ants.clear();
		this.targets.clear();
		this.sources.clear();
	}

	restart() {
		this.reset();
		this.startLevel(this.level);
	}

	startLevel(level: number) {
		this.level = level;
		this.screen = "game";

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
			this.ants.add(new Ant(null, this.targets.entities));
		}
	}

	onTargetIdle(target: Target) {
		for (const ant of this.ants.entities) {
			ant.setTarget(closest(ant.pos, this.targets.entities));
		}
		this.shockwaveCooldown = 0;
		this.shockwave(target.position.x, target.position.y);
		this.isStarting = false;
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

		if (
			this.targets.entities.some((target) =>
				target.isCloseToSource(this.sources.entities),
			)
		) {
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
