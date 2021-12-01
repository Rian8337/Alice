/**
 * Represents a beatmapset from sayobot.
 */
export interface SayobotBeatmap {
    readonly approved: number;
    readonly artist: string;
    readonly artistU: string;
    readonly title: string;
    readonly titleU: string;
    readonly creator: string;
    readonly favourite_count: number;
    readonly lastupdate: number;
    readonly modes: number;
    readonly order: number;
    readonly play_count: number;
    readonly sid: number;
}
