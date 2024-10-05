import type { FederatedPointerEvent, Texture } from "pixi.js";
import { Circle } from "./Circle";
import type { Ant, Game, Target } from "./game";
import {
	Ant1_Default,
	Ant2_Default,
	Ant3_Default,
	Bg,
	Target1_lvl1,
} from "./assets";

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
			{game.ants.entities.map(
				(ant, i) => ant.state == "dead" && <AntC key={i} ant={ant} />,
			)}
			{game.ants.entities.map(
				(ant, i) => ant.state != "dead" && <AntC key={i} ant={ant} />,
			)}
			{game.targets.entities.map((target, i) => (
				<TargetC key={i} target={target} />
			))}
			{game.sources.map(({ x, y }, i) => (
				<Circle key={i} x={x} y={y} radius={20} color={0x0000ff} />
			))}
		</container>
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
			rotation={ant.rotation + Math.PI / 2}
			alpha={
				ant.state == "appearing" ? ant.lt / ant.appearDuration
				: ant.state == "dead" ?
					(1 - ant.lt / ant.dieDuration) / 3
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
