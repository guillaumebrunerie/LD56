import { BackdropBlurFilter } from "pixi-filters";
import { BtnGamePausedTxt, BtnGameTxt, BtnOverTxt } from "./assets";
import { CustomText } from "./CustomText";
import type { Game } from "./game";
import { Rectangle } from "./Rectangle";

const buttonsY = 850;

const buttonsXLeft = 1920 / 3;
const buttonsXRight = (1920 * 2) / 3;

const backdropFilter = new BackdropBlurFilter();
const textColor = "#DDD";

export const PauseScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.01}
				color={0}
				filters={backdropFilter}
				cursor="pointer"
				eventMode="static"
				onPointerDown={() => {
					game.resume();
				}}
			/>
			<sprite
				texture={BtnGamePausedTxt}
				anchor={0.5}
				x={1920 / 2}
				y={450}
				scale={1.5}
			/>
			<RestartButton game={game} />
			<MainMenuButton game={game} />
			<CustomText
				x={1920 / 2}
				y={980}
				anchor={0.5}
				text="(click anywhere to resume)"
				style={{
					fontSize: 20,
					fontFamily: "Heroes Legend",
					fill: textColor,
					dropShadow: {
						angle: 90,
						distance: 3,
					},
				}}
			/>
		</container>
	);
};

const RestartButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Restart"
			cursor="pointer"
			eventMode="static"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			onPointerDown={() => {
				game.restart();
			}}
		/>
	);
};

const NextLevelButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Next level"
			cursor="pointer"
			eventMode="static"
			style={{ fontFamily: "Heroes Legend", fill: textColor }}
			onPointerDown={() => {
				game.nextLevel();
			}}
		/>
	);
};

const MainMenuButton = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={buttonsXLeft}
			y={buttonsY}
			anchor={0.5}
			text="Main menu"
			style={{
				fontFamily: "Heroes Legend",
				fill: textColor,
				dropShadow: {
					angle: 90,
					distance: 6,
				},
			}}
			cursor="pointer"
			eventMode="static"
			onPointerDown={() => {
				game.backToMainMenu();
			}}
		/>
	);
};

export const GameOverScreen = ({ game }: { game: Game }) => {
	return (
		<container>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				filters={backdropFilter}
				alpha={0.3}
				color={0}
			/>
			<sprite texture={BtnGameTxt} anchor={0.5} x={1920 / 2} y={300} />
			<sprite texture={BtnOverTxt} anchor={0.5} x={1920 / 2} y={550} />
			<container y={70}>
				<RestartButton game={game} />
				<MainMenuButton game={game} />
			</container>
		</container>
	);
};

export const WinScreen = ({ game }: { game: Game }) => {
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
			<NextLevelButton game={game} />
			<MainMenuButton game={game} />
		</container>
	);
};
