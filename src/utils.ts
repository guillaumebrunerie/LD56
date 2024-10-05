import { useReducer } from "react";

export const mod = (a: number, b: number) => (b + (a % b)) % b;

export const useForceUpdate = () => {
	const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
	return forceUpdate;
};

export type Point = {
	x: number;
	y: number;
};
