/**
 * Represents the beatmap that is currently being picked by the host of the room.
 */
export interface PickedBeatmap {
    /**
     * The ID of the beatmap.
     */
    id: number;

    /**
     * The beatmapset ID of the beatmap.
     */
    setId: number;

    /**
     * The MD5 hash of the beatmap.
     */
    hash: string;

    /**
     * The name of the beatmap.
     */
    name: string;

    /**
     * The total duration of the beatmap, in seconds.
     */
    duration: number;
}
