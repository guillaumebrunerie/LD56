import "pixi.js/advanced-blend-modes";

import {
	ColorMatrixFilter,
	Graphics,
	type FederatedPointerEvent,
	type Texture,
} from "pixi.js";
import type { Game, PowerUp } from "./game";
import {
	Ant1_Dead,
	Ant1,
	Ant2_Dead,
	Ant2,
	Ant3_Dead,
	Ant3,
	Ant_BloodStain,
	Bg,
	Source1_Closed_Lvl1,
	Source1_Closed_Lvl2,
	Source1_Closed_Lvl3,
	Source1_Closed_Lvl4,
	Source1_Open,
	Target1,
	Target_Shadow,
	Shockwave as ShockwaveA,
	MenuMoonSky,
	MenuMoon,
	MenuMoonGlow,
	MenuMoon_Shadow2,
	Target1End,
	PauseBtn,
	Click,
	Target2,
	Target3,
	Target4,
	Target5,
	Target6,
	Target2End,
	Target3End,
	Target4End,
	Target5End,
	Target6End,
	PowerUp1,
	PowerUp2,
	PowerUp3,
} from "./assets";
import type { Source } from "./source";
import type { Ant } from "./ant";
import type { Target } from "./target";
import { CustomText } from "./CustomText";
import { Rectangle } from "./Rectangle";
import type { Shockwave } from "./shockwave";
import { Ring } from "./Ring";
import { getFrame } from "./Animation";
import { levels } from "./levels";
import { levelAngle } from "./levelSelector";
import { useRef } from "react";
import { GameOverScreen, PauseScreen, WinScreen } from "./Postings";
import { Circle } from "./Circle";

export const GameC = ({ game }: { game: Game }) => {
	if (game.state == "levelSelect") {
		return <LevelSelectScreen game={game} />;
	}

	return (
		<container>
			<sprite
				texture={Bg}
				x={0}
				y={0}
				eventMode="static"
				onPointerDown={(e: FederatedPointerEvent) => {
					const { x, y } = e.global;
					game.tap(x, y);
				}}
			/>
			{game.sources.entities.map(
				(source, i) =>
					source.isDestroyed && <SourceC key={i} source={source} />,
			)}
			{game.sources.entities.map(
				(source, i) =>
					!source.isDestroyed && <SourceC key={i} source={source} />,
			)}
			{game.ants.entities.map(
				(ant, i) =>
					ant.state == "dead" && (
						<DeadAntBloodStainC key={i} ant={ant} />
					),
			)}
			{game.ants.entities.map(
				(ant, i) =>
					ant.state == "dead" && <DeadAntC key={i} ant={ant} />,
			)}
			{game.ants.entities.map(
				(ant, i) =>
					ant.state != "dead" && <AntShadowC key={i} ant={ant} />,
			)}
			{game.ants.entities.map(
				(ant, i) => ant.state != "dead" && <AntC key={i} ant={ant} />,
			)}
			{game.targets.entities.map((target, i) => (
				<TargetC key={i} target={target} />
			))}
			{game.sources.entities.map((source, i) => (
				<SourceHealth key={i} source={source} />
			))}
			{game.shockwaves.entities.map((shockwave, i) => (
				<ShockwaveC key={i} shockwave={shockwave} />
			))}
			<PowerUpButtons game={game} />
			{game.state == "game" && <PauseButton game={game} />}
			{game.state == "gameover" && <GameOverScreen game={game} />}
			{game.state == "win" && <WinScreen game={game} />}
			{game.state == "pause" && <PauseScreen game={game} />}
		</container>
	);
};

const PowerUpButtons = ({ game }: { game: Game }) => {
	return game.powerUps.map((powerUp, i) => (
		<container
			key={i}
			x={(1920 / (game.powerUps.length + 1)) * (i + 1)}
			y={950}
		>
			<PowerUpButton game={game} powerUp={powerUp} />
		</container>
	));
};

const PowerUpTexture = {
	shockwave: PowerUp1,
	push: PowerUp3,
	bomb: PowerUp2,
};

const PowerUpButton = ({ game, powerUp }: { game: Game; powerUp: PowerUp }) => {
	game.lt;
	const ref = useRef<Graphics | null>(null);
	const maskY = (100 * game.cooldowns[powerUp]) / game.delays[powerUp] - 50;
	return (
		<container y={game.activePowerUp == powerUp ? 20 : 0}>
			<Rectangle
				x={-75}
				y={-75}
				width={150}
				height={150}
				alpha={0}
				draw={() => {}}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					void Click.play();
					game.selectPowerUp(powerUp);
				}}
			/>
			<sprite
				texture={PowerUpTexture[powerUp]}
				anchor={0.5}
				alpha={0.25}
			/>
			<sprite
				texture={PowerUpTexture[powerUp]}
				anchor={0.5}
				mask={ref.current}
			>
				<Rectangle
					myRef={ref}
					x={-200}
					y={maskY}
					width={400}
					height={400}
					draw={() => {}}
				/>
			</sprite>
		</container>
	);
};

const PauseButton = ({ game }: { game: Game }) => {
	return (
		<container x={1920 - 50} y={50}>
			<Rectangle
				x={-50}
				y={-50}
				width={100}
				height={100}
				alpha={0}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					void Click.play();
					game.pause();
				}}
				draw={() => {}}
			/>
			<sprite texture={PauseBtn} anchor={0.5} />
		</container>
	);
};

const LevelSelectScreen = ({ game }: { game: Game }) => {
	const skyScale = 1.6;
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0}
				eventMode="static"
				onPointerDown={(e: FederatedPointerEvent) => {
					game.levelSelector.touchStart({ ...e.global });
				}}
				onGlobalPointerMove={(e: FederatedPointerEvent) => {
					game.levelSelector.touchDrag({ ...e.global });
				}}
				onPointerUp={() => {
					game.levelSelector.touchEnd();
				}}
				onPointerUpOutside={() => {
					game.levelSelector.touchEnd();
				}}
			/>
			<sprite
				anchor={0}
				scale={skyScale}
				texture={MenuMoonSky}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.lt * 0.01}
			/>
			<sprite
				anchor={0}
				scale={skyScale}
				texture={MenuMoonSky}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.lt * 0.01 + Math.PI / 2}
			/>
			<sprite
				anchor={0}
				scale={skyScale}
				texture={MenuMoonSky}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.lt * 0.01 + Math.PI}
			/>
			<sprite
				anchor={0}
				scale={skyScale}
				texture={MenuMoonSky}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.lt * 0.01 + (Math.PI * 3) / 2}
			/>
			<container
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.levelSelector.rotation}
			>
				<sprite anchor={0.5} scale={2} texture={MenuMoon} />
				{game.levelSelector.ants.entities.map((ant, i) => (
					<AntShadowC key={i} ant={ant} />
				))}
				{game.levelSelector.ants.entities.map((ant, i) => (
					<AntC key={i} ant={ant} />
				))}
			</container>
			<sprite
				anchor={0.5}
				scale={2}
				texture={MenuMoonGlow}
				blendMode="add"
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
			/>
			<sprite
				anchor={0.5}
				scale={2}
				texture={MenuMoon_Shadow2}
				blendMode="multiply"
				alpha={0.85}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y - 100}
			/>
			<container
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.levelSelector.rotation}
			>
				{levels.map(({ name }, i) => (
					<LevelCard
						game={game}
						key={i}
						level={i + 1}
						name={name}
						mainRotation={game.levelSelector.rotation}
					/>
				))}
			</container>
			<sprite
				anchor={0.5}
				scale={2}
				texture={MenuMoon_Shadow2}
				blendMode="multiply"
				alpha={0.3}
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y - 100}
			/>
			{/* <sprite */}
			{/* 	anchor={0.5} */}
			{/* 	scale={2} */}
			{/* 	texture={MenuMoon_Shadow} */}
			{/* 	// blendMode="color-burn" */}
			{/* 	tint={"#0000FF"} */}
			{/* 	alpha={0} */}
			{/* 	x={game.levelSelector.center.x} */}
			{/* 	y={game.levelSelector.center.y - 100} */}
			{/* /> */}
		</container>
	);
};

const TargetTexture = [
	Target1,
	Target1,
	Target2,
	Target3,
	Target4,
	Target5,
	Target6,
];

const angleThreshold = 0.1;

type LevelCardProps = {
	game: Game;
	level: number;
	name: string;
	mainRotation: number;
};

const LevelCard = ({ game, level, name, mainRotation }: LevelCardProps) => {
	const levelText = `LEVEL ${level}`;
	const angle = (level - 1) * levelAngle;
	const minAngle = -mainRotation + levelAngle - Math.PI;
	const maxAngle = -mainRotation + levelAngle + Math.PI;
	const isDownRef = useRef(false);
	const targetId = levels[level - 1].targets[0].id;
	if (level * levelAngle < minAngle || level * levelAngle > maxAngle) {
		return null;
	}
	return (
		<container
			x={800 * Math.sin(angle)}
			y={-800 * Math.cos(angle)}
			rotation={angle}
		>
			<Rectangle
				x={-220}
				y={-150}
				width={440}
				height={420}
				alpha={0}
				cursor="pointer"
				draw={() => {}}
				eventMode="static"
				onPointerDown={(e: FederatedPointerEvent) => {
					isDownRef.current = true;
					game.levelSelector.touchStart({ ...e.global });
				}}
				onPointerUp={() => {
					game.levelSelector.touchEnd();
					if (
						isDownRef.current &&
						Math.abs(mainRotation + (level - 1) * levelAngle) <
							angleThreshold
					) {
						game.startLevel(level);
					}
					isDownRef.current = false;
				}}
				onPointerUpOutside={() => {
					game.levelSelector.touchEnd();
					isDownRef.current = false;
				}}
			/>
			<sprite anchor={0.5} scale={2} texture={Target_Shadow} />
			<sprite anchor={0.5} scale={2} texture={TargetTexture[targetId]} />
			<container y={150}>
				<CustomText
					anchor={0.5}
					x={0}
					y={5}
					style={{
						fill: "#222",
						fontSize: 36,
						fontFamily: "Comix Loud",
					}}
					text={levelText}
				/>
				<CustomText
					anchor={0.5}
					style={{
						fill: "#ff75f1",
						fontSize: 36,
						fontFamily: "Comix Loud",
					}}
					text={levelText}
				/>
			</container>
			<container y={200}>
				<CustomText
					anchor={{ x: 0.5, y: 0 }}
					x={0}
					y={5}
					style={{
						fill: "#222",
						fontSize: 40,
						fontFamily: "Laffayette Comic Pro",
					}}
					text={name}
				/>
				<CustomText
					anchor={{ x: 0.5, y: 0 }}
					style={{
						fill: "#ffdefc",
						fontSize: 40,
						fontFamily: "Laffayette Comic Pro",
					}}
					text={name}
				/>
			</container>
		</container>
	);
};

const closedSourceTextures = [
	Source1_Closed_Lvl1,
	Source1_Closed_Lvl2,
	Source1_Closed_Lvl3,
	Source1_Closed_Lvl4,
];

const SourceC = ({ source }: { source: Source }) => {
	return (
		<sprite
			anchor={0.5}
			texture={
				source.isDestroyed ?
					closedSourceTextures[
						Math.floor(
							(source.healthCurrent / source.healthMax) * 3,
						)
					]
				:	Source1_Open
			}
			x={source.pos.x}
			y={source.pos.y}
		/>
	);
};

const SourceHealth = ({ source }: { source: Source }) => {
	// if (source.isDestroyed) {
	// 	return null;
	// }
	const width = 100;
	const height = 8;
	const dy = 70;
	return (
		<container>
			<Rectangle
				x={source.pos.x - width / 2}
				y={source.pos.y - height / 2 - dy}
				width={100}
				height={height}
				color={source.isDestroyed ? 0xdddddd : 0xff0000}
				draw={() => {}}
			/>
			<Rectangle
				x={source.pos.x - width / 2}
				y={source.pos.y - height / 2 - dy}
				width={(100 * source.healthCurrent) / source.healthMax}
				height={height}
				color={source.isDestroyed ? 0x00d4ff : 0x00ff00}
				draw={() => {}}
			/>
		</container>
	);
	// return (
	// 	<CustomText
	// 		anchor={0.5}
	// 		alpha={source.isDestroyed ? 0 : 1}
	// 		x={source.pos.x}
	// 		y={source.pos.y - 70}
	// 		scale={0.5}
	// 		text={`${source.healthCurrent.toFixed(0)} / ${source.healthMax.toFixed(0)}`}
	// 	/>
	// );
};

const antWalk: Record<number, Texture[]> = {
	1: Ant1,
	2: Ant2,
	3: Ant3,
};

const antDeadTexture: Record<number, Texture> = {
	1: Ant1_Dead,
	2: Ant2_Dead,
	3: Ant3_Dead,
};

const AntC = ({ ant }: { ant: Ant }) => {
	const alpha = ant.state == "appearing" ? ant.lt / ant.appearDuration : 1;

	return (
		<container>
			<sprite
				anchor={0.5}
				texture={getFrame(antWalk[ant.level], 20, ant.lt)}
				x={ant.pos.x}
				y={ant.pos.y}
				rotation={ant.direction + Math.PI / 2}
				alpha={alpha}
			/>
		</container>
	);
};

const darkFilter = new ColorMatrixFilter();
darkFilter.matrix = [
	0,
	0,
	0,
	0,
	0x10 / 256,
	0,
	0,
	0,
	0,
	0x10 / 256,
	0,
	0,
	0,
	0,
	0x10 / 256,
	0,
	0,
	0,
	1,
	0,
];
const shadowDx = 1;
const shadowDy = 2;

const AntShadowC = ({ ant }: { ant: Ant }) => {
	// return null;
	const alpha = ant.state == "appearing" ? ant.lt / ant.appearDuration : 1;

	return (
		<container>
			<sprite
				filters={[darkFilter]}
				anchor={0.5}
				texture={getFrame(antWalk[ant.level], 20, ant.lt)}
				x={ant.pos.x + shadowDx}
				y={ant.pos.y + shadowDy}
				rotation={ant.direction + Math.PI / 2}
				alpha={alpha * 0.6}
			/>
		</container>
	);
};

const DeadAntC = ({ ant }: { ant: Ant }) => {
	const alpha = 1 - ant.lt / ant.dieDuration;

	return (
		<sprite
			anchor={0.5}
			texture={antDeadTexture[ant.level]}
			x={ant.pos.x}
			y={ant.pos.y}
			rotation={ant.direction + Math.PI / 2}
			alpha={alpha}
		/>
	);
};

const DeadAntBloodStainC = ({ ant }: { ant: Ant }) => {
	const alpha = 1 - ant.lt / ant.dieDuration;

	return (
		<sprite
			anchor={0.5}
			texture={Ant_BloodStain}
			blendMode="overlay"
			alpha={alpha}
			x={ant.pos.x}
			y={ant.pos.y}
		/>
	);
};

const TargetEnd = [
	Target1End,
	Target1End,
	Target2End,
	Target3End,
	Target4End,
	Target5End,
	Target6End,
];

const TargetC = ({ target }: { target: Target }) => {
	const nt =
		target.state == "idle" || target.state == "disappearing" ? 1
		: target.lt < target.appearOffset ? 0
		: Math.pow(
				(target.lt - target.appearOffset) / target.appearDuration,
				2,
			);

	const dy = 800 * (1 - nt);
	const alpha = nt;
	const scale = (1 - nt) * 3 + 1;

	const alphaShadow = target.state == "disappearing" ? 0 : nt;
	const scaleShadow = (1 - nt) * 2 + 1;

	return (
		<container>
			<sprite
				anchor={0.5}
				texture={Target_Shadow}
				alpha={alphaShadow}
				scale={scaleShadow}
				x={target.pos.x}
				y={target.pos.y}
			/>
			<sprite
				anchor={0.5}
				texture={
					target.state == "disappearing" ?
						getFrame(
							TargetEnd[target.item],
							20,
							target.lt,
							"remove",
						)
					:	TargetTexture[target.item]
				}
				alpha={alpha}
				scale={scale}
				x={target.pos.x}
				y={target.pos.y - dy}
			/>
		</container>
	);
};

const ShockwaveC = ({ shockwave }: { shockwave: Shockwave }) => {
	// return null;
	const ringsAlpha = 0;
	return (
		<container>
			<sprite
				anchor={0.5}
				texture={getFrame(ShockwaveA, 50, shockwave.lt, "remove")}
				x={shockwave.center.x}
				y={shockwave.center.y}
				scale={shockwave.strength + 0.5}
				alpha={shockwave.strength * 0.7 + 0.3}
			/>
			<Ring
				x={shockwave.center.x}
				y={shockwave.center.y}
				radius={shockwave.innerRadius}
				strokeWidth={10}
				color={0xff0000}
				alpha={ringsAlpha}
				draw={() => {}}
			/>
			<Ring
				x={shockwave.center.x}
				y={shockwave.center.y}
				radius={shockwave.outerRadius}
				strokeWidth={10}
				color={0xff0000}
				alpha={ringsAlpha}
				draw={() => {}}
			/>
		</container>
	);
};
