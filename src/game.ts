import { Ant } from "./ant";
import {
	BombPlaced,
	Click,
	CompleteLevel,
	Explosion,
	FreezeSound,
	HologramSound,
	LoseGame,
	Music,
	MusicMenu,
	Push,
	ShockwaveSound,
	StartLevel,
	TargetFall,
} from "./assets";
import { Bomb } from "./bomb";
import { Freeze } from "./freeze";
import { levels } from "./levels";
import { LevelSelector } from "./levelSelector";
import { Shockwave } from "./shockwave";
import { Source } from "./source";
import { Target } from "./target";
import { distanceBetween, none, randomAroundPoint, type Point } from "./utils";

export type PowerUp = "shockwave" | "push" | "bomb" | "hologram" | "freeze";

export class Game {
	lt = 0;
	ants: Ant[] = [];
	targets: Target[] = [];
	sources: Source[] = [];
	shockwaves: Shockwave[] = [];
	bombs: Bomb[] = [];
	freezes: Freeze[] = [];
	levelSelector: LevelSelector;
	antValue = 0;
	level = 0;
	powerUps: PowerUp[] = ["shockwave", "push", "bomb", "hologram", "freeze"];
	activePowerUp: PowerUp = "shockwave";
	cooldowns = {
		shockwave: 0,
		push: 0,
		bomb: 0,
		hologram: 0,
		freeze: 0,
	};
	delays = {
		shockwave: 0.7,
		push: 2,
		bomb: 7,
		hologram: 5,
		freeze: 5,
	};
	startLt = 0;

	isPaused = false;
	state:
		| "logo"
		| "levelSelect"
		| "gameStarting"
		| "game"
		| "gameover"
		| "win" = "logo";

	constructor() {
		this.ants = [];
		this.targets = [];
		this.sources = [];
		this.shockwaves = [];
		this.bombs = [];
		this.freezes = [];
		this.levelSelector = new LevelSelector();
	}

	updateGameGlow() {
		document.body.className =
			this.state == "levelSelect" ? "levelSelector" : "";
	}

	resetLastUnlockedLevel() {
		this.levelSelector.resetLastLevel();
	}

	skipLogo() {
		this.state = "levelSelect";
		this.updateGameGlow();
		MusicMenu.singleInstance = true;
		void MusicMenu.play({ loop: true, volume: 0.5 });
	}

	reset() {
		this.antValue = 0;
		this.ants = [];
		this.targets = [];
		this.sources = [];
		this.shockwaves = [];
		this.bombs = [];
		this.freezes = [];
		this.cooldowns.shockwave = 0;
		this.cooldowns.push = 0;
		this.cooldowns.bomb = 0;
		this.cooldowns.hologram = 0;
		this.cooldowns.freeze = 0;
		this.activePowerUp = "shockwave";
		this.isPaused = false;
		void Music.stop();
	}

	backToMainMenu() {
		this.reset();
		this.state = "levelSelect";
		this.updateGameGlow();
		void MusicMenu.resume();
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
		void MusicMenu.pause();
		void StartLevel.play({ volume: 0.5 });
		this.level = level;
		this.state = "gameStarting";
		this.startLt = 0;
		this.activePowerUp = "shockwave";
		this.updateGameGlow();

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
			this.targets.push(
				new Target(
					targetData.id,
					randomAroundPoint(targetData.pos, targetData.delta),
					(target) => this.onTargetIdle(target),
				),
			);
		}

		for (const sourceData of levelData.sources) {
			this.sources.push(
				new Source(randomAroundPoint(sourceData.pos, sourceData.delta)),
			);
		}

		// Initial ants
		for (let i = 0; i < levelData.initialAnts; i++) {
			this.ants.push(new Ant());
		}

		this.powerUps = levelData.powerUps;
	}

	onTargetIdle(target: Target) {
		TargetFall.singleInstance = true;
		void TargetFall.play({ volume: 0.5 });
		for (const ant of this.ants) {
			ant.pickTarget(this.targets, this.sources);
		}
		this.shockwave(target.pos);
		this.cooldowns.shockwave = 0;
		this.state = "game";
	}

	selectPowerUpByIndex(n: number) {
		if (
			n <= this.powerUps.length &&
			!this.isPaused &&
			(this.state == "game" || this.state == "gameStarting")
		) {
			this.selectPowerUp(this.powerUps[n - 1]);
		}
	}

	selectPowerUp(powerUp: PowerUp) {
		if (this.cooldowns[powerUp] == 0 && this.activePowerUp != powerUp) {
			this.activePowerUp = powerUp;
			navigator?.vibrate(50);
			void Click.play();
		}
	}

	carryingForce(target: Target) {
		let force = 0;
		for (const ant of this.ants) {
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
		for (const ant of this.ants) {
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
		void MusicMenu.pause();
		this.isPaused = true;
	}

	resume() {
		if (this.state == "levelSelect") {
			void MusicMenu.resume();
		} else {
			void Music.resume();
		}
		this.isPaused = false;
	}

	tick(delta: number) {
		if (this.isPaused) {
			return;
		}
		this.lt += delta;
		this.startLt += delta;

		// Level selector
		this.levelSelector.tick(delta);

		// Create new ants
		if (this.state == "game") {
			this.antValue += delta * 2;
			for (; this.antValue >= 1; this.antValue--) {
				for (const source of this.sources) {
					if (source.isDestroyed) {
						continue;
					}
					const ant = new Ant(source);
					this.ants.push(ant);
					ant.pickTarget(this.targets, this.sources);
				}
			}
		}

		// Targets
		for (const target of this.targets) {
			const carryingForce = this.carryingForce(target);
			target.carry(
				delta,
				carryingForce,
				this.sources.filter((source) => !source.isDestroyed),
				this.freezes,
			);
			target.tick(delta);
			target.shockwave(delta, this.shockwaves);
			if (
				target.isCloseToSource(this.sources) &&
				!target.isHologram &&
				target.state != "disappearing"
			) {
				target.disappear();
			}
		}
		this.targets = this.targets.filter(
			(target) =>
				!(
					target.isHologram &&
					target.state == "disappearing" &&
					target.lt > target.disappearDuration
				),
		);

		// Ants
		this.ants = this.ants.filter((ant) => !ant.isGone());
		for (const ant of this.ants) {
			ant.tick(delta, this.freezes);
			ant.shockwave(delta, this.shockwaves, this.freezes);
			ant.moveAwayIfTooClose(delta);
			if (this.state == "game") {
				ant.pickTarget(this.targets, this.sources);
			}
		}

		// Sources
		for (const source of this.sources) {
			source.shockwave(delta, this.shockwaves);
			const healingForce = this.healingForce(source);
			source.heal(delta, healingForce, this.freezes);
		}

		// Shockwaves
		this.shockwaves = this.shockwaves.filter(
			(shockwave) => !shockwave.gone,
		);
		for (const shockwave of this.shockwaves) {
			shockwave.tick(delta);
		}

		// Bombs
		for (const bomb of this.bombs) {
			bomb.tick(delta);
			if (bomb.timeout == 0) {
				navigator?.vibrate([50, 50, 300]);
				void Explosion.play({ volume: 0.5 });
				this.shockwaves.push(
					new Shockwave(bomb.pos, -300, 100, 5000, 1, "bomb"),
				);
			}
		}
		this.bombs = this.bombs.filter((bomb) => bomb.timeout > 0);

		// Freezes
		for (const freeze of this.freezes) {
			freeze.tick(delta);
		}
		this.freezes = this.freezes.filter((freeze) => freeze.state != "gone");

		// Cooldowns
		for (const key of this.powerUps) {
			this.cooldowns[key] -= delta;
			if (this.cooldowns[key] < 0) {
				this.cooldowns[key] = 0;
			}
		}

		// Game over
		if (
			this.targets.some(
				(target) =>
					target.state == "disappearing" &&
					target.lt > target.disappearDuration &&
					!target.isHologram,
			)
		) {
			this.gameOver();
		}

		// Win
		if (
			this.ants.every((ant) => ant.state == "dead") &&
			this.sources.every((source) => source.isDestroyed) &&
			this.state == "game"
		) {
			this.win();
		}
	}

	gameOver() {
		void LoseGame.play({ volume: 0.5 });
		this.state = "gameover";
		for (const ant of this.ants) {
			ant.win();
		}
		this.cooldowns.shockwave = 0;
		this.cooldowns.push = 0;
		this.cooldowns.bomb = 0;
		this.cooldowns.hologram = 0;
		this.cooldowns.freeze = 0;
	}

	win() {
		void Music.pause();
		void CompleteLevel.play({ volume: 0.5 });
		this.levelSelector.unlockNextLevel(this.level);
		this.state = "win";
		this.startLt = 0;
		this.cooldowns.shockwave = 0;
		this.cooldowns.push = 0;
		this.cooldowns.bomb = 0;
		this.cooldowns.hologram = 0;
		this.cooldowns.freeze = 0;
	}

	tap(pos: Point) {
		switch (this.activePowerUp) {
			case "shockwave":
				this.shockwave(pos);
				break;
			case "push":
				this.push(pos);
				break;
			case "bomb":
				this.bomb(pos);
				break;
			case "hologram":
				this.hologram(pos);
				break;
			case "freeze":
				this.freeze(pos);
				break;
		}
	}

	isAlmostWon() {
		return (
			this.ants.length <= 5 &&
			this.sources.every((source) => source.isDestroyed)
		);
	}

	shockwave(pos: Point) {
		if (this.state == "gameover" || this.state == "win") {
			return;
		}
		const strength = 1 - this.cooldowns.shockwave / this.delays.shockwave;
		navigator?.vibrate(50 * strength);
		void ShockwaveSound.play({ volume: 0.3 * strength });
		this.cooldowns.shockwave = this.delays.shockwave;
		const adjustedStrength = this.isAlmostWon() ? strength * 5 : strength;
		this.shockwaves.push(
			new Shockwave(pos, -300, 100, 5000, adjustedStrength),
		);
	}

	push(pos: Point) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.push > 0
		) {
			return;
		}
		void Push.play({ volume: 0.5 });
		navigator?.vibrate(100);
		this.cooldowns.push = this.delays.push;
		this.shockwaves.push(new Shockwave(pos, -300, 100, 5000, 1, "push"));
		this.activePowerUp = "shockwave";
	}

	bomb(pos: Point) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.bomb > 0
		) {
			return;
		}

		navigator?.vibrate(50);
		void BombPlaced.play({ volume: 0.7 });
		this.bombs.push(new Bomb(pos));
		this.cooldowns.bomb = this.delays.bomb;
		this.activePowerUp = "shockwave";
	}

	hologram(pos: Point) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.hologram > 0
		) {
			return;
		}
		this.cooldowns.hologram = this.delays.hologram;
		this.activePowerUp = "shockwave";
		navigator?.vibrate([150, 50, 150]);
		void HologramSound.play({ volume: 0.5 });
		this.targets.push(
			new Target(
				0,
				pos,
				(target) => {
					for (const ant of this.ants) {
						if (
							Math.random() <
							100 / distanceBetween(ant.pos, target.pos)
						) {
							ant.setTarget(target);
						}
					}
				},
				true,
			),
		);
	}

	freeze(pos: Point) {
		if (
			this.state == "gameover" ||
			this.state == "win" ||
			this.cooldowns.freeze > 0
		) {
			return;
		}
		navigator?.vibrate([300]);
		void FreezeSound.play({ volume: 0.5 });
		this.freezes.push(new Freeze(pos));
		this.cooldowns.freeze = this.delays.freeze;
		this.activePowerUp = "shockwave";
	}
}
