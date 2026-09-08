/**
 * Represents a beatmap's difficulty metadata.
 */
export interface OfficialDatabaseBeatmapDifficulty {
    readonly beatmap_hash: string;
    readonly circle_size: number;
    readonly approach_rate: number;
    readonly overall_difficulty: number;
    readonly hp_drain: number;
}