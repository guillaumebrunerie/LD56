import { TextStyle, type Text, type TextStyleOptions } from "pixi.js";
import type { ComponentProps, Ref } from "react";

export const CustomText = ({
	myRef,
	style,
	...rest
}: {
	myRef?: Ref<Text>;
	style?: Partial<TextStyleOptions>;
} & ComponentProps<"pixiText">) => {
	return (
		<pixiText
			ref={myRef}
			style={
				new TextStyle({
					fontFamily: "Comix Loud",
					fontSize: 50,
					// fontWeight: "800",
					letterSpacing: 4,
					lineHeight: 50,
					stroke: {
						width: 3,
						color: "#333",
					},
					fill: "#FFFFFF",
					align: "center",
					...style,
				})
			}
			{...rest}
		/>
	);
};
