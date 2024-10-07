import { Ant } from "./ant";
import {
	CompleteLevel,
	LoseGame,
	Music,
	MusicMenu,
	ShockwaveSound,
	StartLevel,
	TargetFall,
} from "./assets";
import { Bomb } from "./bomb";
import { Entity } from "./entities";
import { EntityArray } from "./entitiesArray";
import { levels } from "./levels";
import { LevelSelector } from "./levelSelector";
import { Shockwave } from "./shockwave";
import { Source } from "./source";
import { Target } from "./target";
import { none, randomAroundPoint } from "./utils";

export type PowerUp = "shockwave" | "push" | "bomb";

export class Game extends Entity {
	ants: EntityArray<Ant>;
	targets: EntityArray<Target>;
	sources: EntityArray<Source>;
	shockwaves: EntityArray<Shockwave>;
	bombs: EntityArray<Bomb>;
	levelSelector: LevelSelector;
	antValue = 0;
	level = 0;
	powerUps: PowerUp[] = ["shockwave", "push", "bomb"];
	activePowerUp: PowerUp = "shockwave";
	cooldowns = {
		shockwave: 0,
		push: 0,
		bomb: 0,
	};
	delays = {
		shockwave: 0.7,
		push: 3,
		bomb: 5,
	};

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
		this.bombs = new EntityArray<Bomb>();
		this.levelSelector = new LevelSelector();
		this.addChildren(
			this.ants,
			this.targets,
			this.sources,
			this.shockwaves,
			this.bombs,
			this.levelSelector,
		);
		this.addTicker((delta) => this.tick(delta));
	}

	init() {
		MusicMenu.singleInstance = true;
		void MusicMenu.play({ loop: true, volume: 0.5 });
	}

	reset() {
		this.antValue = 0;
		this.ants.clear();
		this.targets.clear();
		this.sources.clear();
		this.shockwaves.clear();
		this.bombs.clear();
		this.cooldowns.shockwave = 0;
		this.cooldowns.push = 0;
		this.cooldowns.bomb = 0;
		this.activePowerUp = "shockwave";
		void Music.stop();
	}

	backToMainMenu() {
		this.reset();
		this.state = "levelSelect";
		void MusicMenu.resume();
	}

	nextLevel() {
		this.level++;
		this.levelSelector.nextLevel();
		this.restart();
	}

	restart() {
		this.reset();
		this.startLevel(this.level);
	}

	startLevel(level: number) {
		void MusicMenu.pause();
		void StartLevel.play({ volume: 0.5 });
		this.level = level;
		this.state = "gameStarting";

		setTimeout(() => {
			Music.singleInstance = true;
			void Music.play({ loop: true, volume: 0.3 });
		}, 700);

		const levelData = levels[level - 1];
		if (!levelData) {
			console.error("level not found");
			return;
		}

		for (const targetData of levelData.targets) {
			this.targets.add(
				new Target(
					targetData.id,
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
		TargetFall.singleInstance = true;
		void TargetFall.play({ volume: 0.5 });
		for (const ant of this.ants.entities) {
			ant.pickTarget(this.targets.entities, this.sources.entities);
		}
		this.shockwave(target.pos.x, target.pos.y);
		this.cooldowns.shockwave = 0;
		this.state = "game";
	}

	selectPowerUp(powerUp: PowerUp) {
		this.activePowerUp = powerUp;
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
		void Music.pause();
		if (this.state == "game") {
			this.state = "pause";
		} else {
			console.error("Cannot pause?");
		}
	}

	resume() {
		void Music.resume();
		this.state = "game";
	}

	tick(delta: number) {
		if (
			this.state == "gameover" ||
			this.state == "pause" ||
			this.state == "win"
		) {
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
			ant.tick(delta);
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

		for (const bomb of this.bombs.entities) {
			bomb.tick(delta);
			if (bomb.timer == 0) {
				void ShockwaveSound.play({ volume: 0.3 });
				this.shockwaves.add(
					new Shockwave(bomb.pos, -300, 100, 5000, 1, "bomb"),
				);
				this.bombs.remove(bomb);
			}
		}

		for (const key of ["shockwave", "push", "bomb"] as const) {
			this.cooldowns[key] -= delta;
			if (this.cooldowns[key] < 0) {
				this.cooldowns[key] = 0;
			}
		}

		const gameOverTarget = this.targets.entities.find((target) =>
			target.isCloseToSource(this.sources.entities),
		);
		if (gameOverTarget && gameOverTarget.state !== "disappearing") {
			gameOverTarget.disappear();
		}
		if (
			this.targets.entities.some(
				(target) =>
					target.state == "disappearing" &&
					target.lt > target.disappearDuration,
			)
		) {
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
		void LoseGame.play({ volume: 0.5 });
		this.state = "gameover";
		for (const ant of this.ants.entities) {
			ant.win();
		}
	}

	win() {
		void Music.pause();
		void CompleteLevel.play({ volume: 0.5 });
		this.state = "win";
	}

	tap(x: number, y: number) {
		switch (this.activePowerUp) {
			case "shockwave":
				this.shockwave(x, y);
				break;
			case "push":
				this.push(x, y);
				break;
			case "bomb":
				this.bomb(x, y);
				break;
		}
	}

	shockwave(x: number, y: number) {
		if (this.state == "gameover" || this.state == "win") {
			return;
		}
		const strength =
			(1 - this.cooldowns.shockwave / this.delays.shockwave) ** 2;
		void ShockwaveSound.play({ volume: 0.3 * strength });
		this.cooldowns.shockwave = this.delays.shockwave;
		this.shockwaves.add(new Shockwave({ x, y }, -300, 100, 5000, strength));
	}

	push(x: number, y: number) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.push > 0
		) {
			return;
		}
		void ShockwaveSound.play({ volume: 0.3 });
		this.cooldowns.push = this.delays.push;
		this.shockwaves.add(
			new Shockwave({ x, y }, -300, 100, 5000, 1, "push"),
		);
		this.activePowerUp = "shockwave";
	}

	bomb(x: number, y: number) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.bomb > 0
		) {
			return;
		}
		this.bombs.add(new Bomb({ x, y }));
		this.cooldowns.bomb = this.delays.bomb;
		this.activePowerUp = "shockwave";
	}
}
