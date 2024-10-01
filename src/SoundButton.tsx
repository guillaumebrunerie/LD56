import type { ComponentProps } from "react";
import { SoundOffTxt, SoundOnTxt } from "./assets";
import { useSetVolumeAll } from "./sound";

export const SoundButton = (props: ComponentProps<"sprite">) => {
	const [volumeAll, setVolumeAll] = useSetVolumeAll();
	const toggleSound = () => {
		setVolumeAll((volume) => 1 - volume);
	};

	return (
		<sprite
			{...props}
			texture={volumeAll === 1 ? SoundOnTxt : SoundOffTxt}
			cursor="pointer"
			eventMode="static"
			onPointerDown={toggleSound}
		/>
	);
};
