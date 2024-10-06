import "pixi.js/advanced-blend-modes";

import {
	ColorMatrixFilter,
	type FederatedPointerEvent,
	type Texture,
} from "pixi.js";
import type { Game } from "./game";
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
} from "./assets";
import type { Source } from "./source";
import type { Ant } from "./ant";
import type { Target } from "./target";
import { Circle } from "./Circle";
import { CustomText } from "./CustomText";
import { Rectangle } from "./Rectangle";
import type { Shockwave } from "./shockwave";
import { Ring } from "./Ring";
import { getFrame } from "./Animation";
import { levels } from "./levels";
import { levelAngle } from "./levelSelector";
import { useRef } from "react";

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
					game.shockwave(x, y);
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
			{game.state == "gameover" && <GameOverScreen game={game} />}
			{game.state == "win" && <WinScreen game={game} />}
		</container>
	);
};

const LevelSelectScreen = ({ game }: { game: Game }) => {
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
			<sprite scale={2} texture={MenuMoonSky} x={0} y={0} />
			<container
				x={game.levelSelector.center.x}
				y={game.levelSelector.center.y}
				rotation={game.levelSelector.rotation}
			>
				<sprite anchor={0.5} scale={2} texture={MenuMoon} />
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
				{levels.map(({ level, name }) => (
					<LevelCard
						game={game}
						key={level}
						level={level}
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

type LevelCardProps = {
	game: Game;
	level: number;
	name: string;
	mainRotation: number;
};

const angleThreshold = 0.1;

const LevelCard = ({ game, level, name, mainRotation }: LevelCardProps) => {
	const levelText = `LEVEL ${level}`;
	const angle = (level - 1) * levelAngle;
	const minAngle = -mainRotation + levelAngle - Math.PI;
	const maxAngle = -mainRotation + levelAngle + Math.PI;
	const isDownRef = useRef(false);
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
			<sprite anchor={0.5} scale={2} texture={Target1} />
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
		<container>
			{!source.isDestroyed && false && (
				<Circle
					x={source.pos.x}
					y={source.pos.y}
					radius={50}
					alpha={0}
					draw={() => {}}
					eventMode="static"
					onPointerDown={() => {
						source.hit();
					}}
				/>
			)}
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
		</container>
	);
};

const SourceHealth = ({ source }: { source: Source }) => {
	if (source.isDestroyed) {
		return null;
	}
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
				color={0xff0000}
				draw={() => {}}
			/>
			<Rectangle
				x={source.pos.x - width / 2}
				y={source.pos.y - height / 2 - dy}
				width={(100 * source.healthCurrent) / source.healthMax}
				height={height}
				color={0x00ff00}
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
			alpha={alpha}
			x={ant.pos.x}
			y={ant.pos.y}
		/>
	);
};

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
						getFrame(Target1End, 20, target.lt, "remove")
					:	Target1
				}
				alpha={alpha}
				scale={scale}
				x={target.pos.x}
				y={target.pos.y - dy}
			/>
		</container>
	);
};

const GameOverScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 - 50}
				anchor={0.5}
				text="Game over!"
				style={{ fontFamily: "Heroes Legend" }}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 50}
				anchor={0.5}
				text="Restart?"
				cursor="pointer"
				eventMode="static"
				style={{ fontFamily: "Heroes Legend" }}
				onPointerDown={() => {
					game.restart();
				}}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 150}
				anchor={0.5}
				text="Main menu"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.backToMainMenu();
				}}
			/>
		</container>
	);
};

const WinScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 - 50}
				anchor={0.5}
				text="You win!"
				style={{ fontFamily: "Heroes Legend" }}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 50}
				anchor={0.5}
				text="Next level?"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.nextLevel();
				}}
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 150}
				anchor={0.5}
				text="Main menu"
				style={{ fontFamily: "Heroes Legend" }}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.backToMainMenu();
				}}
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
