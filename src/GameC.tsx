import type { FederatedPointerEvent, Texture } from "pixi.js";
import type { Game } from "./game";
import {
	Ant1_Default,
	Ant2_Default,
	Ant3_Default,
	Bg,
	Source1_Closed_Lvl1,
	Source1_Closed_Lvl2,
	Source1_Closed_Lvl3,
	Source1_Closed_Lvl4,
	Source1_Open,
	Target1_lvl1,
} from "./assets";
import type { Source } from "./source";
import type { Ant } from "./ant";
import type { Target } from "./target";
import { Circle } from "./Circle";
import { CustomText } from "./CustomText";
import { Rectangle } from "./Rectangle";

export const GameC = ({ game }: { game: Game }) => {
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
				(ant, i) => ant.state == "dead" && <AntC key={i} ant={ant} />,
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
			{game.isGameOver && <GameOverScreen game={game} />}
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
				alpha={source.isDestroyed ? 0.5 : 1}
			/>
		</container>
	);
};

const SourceHealth = ({ source }: { source: Source }) => {
	if (source.isDestroyed) {
		return null;
	}
	return (
		<CustomText
			anchor={0.5}
			alpha={source.isDestroyed ? 0 : 1}
			x={source.pos.x}
			y={source.pos.y - 70}
			scale={0.5}
			text={`${source.healthCurrent.toFixed(0)} / ${source.healthMax.toFixed(0)}`}
		/>
	);
};

const antTexture: Record<number, Texture> = {
	1: Ant1_Default,
	2: Ant2_Default,
	3: Ant3_Default,
};

const AntC = ({ ant }: { ant: Ant }) => {
	return (
		<sprite
			anchor={0.5}
			texture={antTexture[ant.level]}
			x={ant.position.x}
			y={ant.position.y}
			rotation={ant.direction + Math.PI / 2}
			alpha={
				ant.state == "appearing" ? ant.lt / ant.appearDuration
				: ant.state == "dead" ?
					(1 - ant.lt / ant.dieDuration) / 2
				:	1
			}
			// color={
			// 	ant.state == "dead" ? 0x333333
			// 	: ant.state == "carrying" ?
			// 		0xbbbbbb
			// 	:	0x888888
			// }
		/>
	);
};

const TargetC = ({ target }: { target: Target }) => {
	return (
		<sprite
			anchor={0.5}
			texture={Target1_lvl1}
			x={target.position.x}
			y={target.position.y}
		/>
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
			/>
			<CustomText
				x={1920 / 2}
				y={1080 / 2 + 50}
				anchor={0.5}
				text="Restart?"
				eventMode="static"
				onPointerDown={() => {
					game.restart();
				}}
			/>
		</container>
	);
};
