/**
 * Options for beatmap retrieval.
 */
export interface BeatmapRetrievalOptions {
    /**
     * Whether to check if the beatmap's `.osu` file is downloaded, and downloads it if it's not. Defaults to `true`.
     */
    checkFile?: boolean;

    /**
     * Whether to skip the cache check and request the osu! API. Defaults to `false`.
     */
    forceCheck?: boolean;

    /**
     * Whether to cache the beatmap after retrieval.
     */
    cacheBeatmap?: boolean;
}
