import { stateNamesMap } from "./stateNames";

export function normalizeStateNames(stateName: string | undefined): string {
  if (!stateName || typeof stateName !== "string" || stateName.trim() === "") {
    return stateName || "";
  }
  const normalizedState = stateName.trim().toLowerCase();

  const abbreviation = stateNamesMap[normalizedState];

  return abbreviation ? abbreviation : stateName;
}
