import { RawDifficultyAttributes } from "./RawDifficultyAttributes";

/**
 * Represents difficulty attributes that is sent as a response to a request.
 */
export type ResponseDifficultyAttributes<T extends RawDifficultyAttributes> =
    Omit<T, "mods"> & { mods: string };
