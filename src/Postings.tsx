import { BackdropBlurFilter } from "pixi-filters";
import {
	BtnCompleteTxt,
	BtnGamePausedTxt,
	BtnGameTxt,
	BtnLevelTxt,
	BtnOverTxt,
	Click,
} from "./assets";
import { CustomText } from "./CustomText";
import type { Game } from "./game";
import { Rectangle } from "./Rectangle";
import { LevelCardContents } from "./GameC";
import { levels } from "./levels";

const buttonsY = 850;

const buttonsXLeft = 1920 / 3;
const buttonsXCenter = 1920 / 2;
const buttonsXRight = (1920 * 2) / 3;

const backdropFilter = new BackdropBlurFilter();
const lightBackdropFilter = new BackdropBlurFilter({ strength: 0 });
const textColor = "#DDD";

const levelIntroDuration = 1.5;

export const LevelIntro = ({ game }: { game: Game }) => {
	const level = game.level;
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
				filters={lightBackdropFilter}
			/>
			<container
				x={1920 / 2}
				y={400}
				anchor={0}
				alpha={1 - (game.startLt / levelIntroDuration) ** 2}
				scale={1.5} // + game.startLt / levelIntroDuration / 2}
			>
				<LevelCardContents
					game={game}
					level={level}
					name={levels[level - 1].name}
				/>
			</container>
		</container>
	);
};

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
					void Click.play();
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
				void Click.play();
				game.restart();
			}}
		/>
	);
};

const NextLevelButton = ({ game }: { game: Game }) => {
	if (game.level == levels.length) {
		return null;
	}
	return (
		<CustomText
			x={buttonsXRight}
			y={buttonsY}
			anchor={0.5}
			text="Next level"
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
				void Click.play();
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
				void Click.play();
				game.backToMainMenu();
			}}
		/>
	);
};

const MainMenuButton2 = ({ game }: { game: Game }) => {
	return (
		<CustomText
			x={game.level == levels.length ? buttonsXCenter : buttonsXLeft}
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
				void Click.play();
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
			<container x={1920 / 2} y={450}>
				<sprite texture={BtnGameTxt} anchor={0.5} />
				<sprite texture={BtnOverTxt} anchor={0.5} />
			</container>
			<container y={70}>
				<RestartButton game={game} />
				<MainMenuButton game={game} />
			</container>
		</container>
	);
};

export const WinScreen = ({ game }: { game: Game }) => {
	const nt = Math.min(game.startLt / 0.5, 1);
	if (nt < 1) {
		return null;
	}
	return (
		<container alpha={nt * nt}>
			<Rectangle
				x={0}
				y={0}
				width={1920}
				height={1080}
				draw={() => {}}
				alpha={0.3}
				color={0}
			/>
			<container x={1920 / 2} y={400}>
				<sprite texture={BtnLevelTxt} anchor={0.5} />
				<sprite texture={BtnCompleteTxt} anchor={0.5} />
			</container>
			<NextLevelButton game={game} />
			<MainMenuButton2 game={game} />
		</container>
	);
};
