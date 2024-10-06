import { sound } from "@pixi/sound";
import { useForceUpdate } from "./utils";

export const initSound = () => {
	sound.init();
};

export const closeSound = () => {
	sound.stopAll();
	sound.removeAll();
	sound.close();
};

export const useSetVolumeAll = () => {
	const forceUpdate = useForceUpdate();
	return [
		sound.volumeAll,
		(setter: (volume: number) => number) => {
			const newVolume = setter(sound.volumeAll);
			console.log(`Setting volume to ${newVolume}.`);
			sound.volumeAll = newVolume;
			forceUpdate();
		},
	] as const;
};
