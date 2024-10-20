const lastUnlockedLevelKey = "MoonPicnic/lastUnlockedLevel";

export const storeLastUnlockedLevel = (level: number) => {
	localStorage.setItem(lastUnlockedLevelKey, `${level}`);
};

export const retrieveLastUnlockedLevel = (max: number): number => {
	const lastLevel = Number(localStorage.getItem(lastUnlockedLevelKey));
	if (!Number.isInteger(lastLevel) || lastLevel < 1 || lastLevel > max) {
		return 1;
	}
	return lastLevel;
};

export const clearStorageLastUnlockedLevel = () => {
	localStorage.removeItem(lastUnlockedLevelKey);
};
