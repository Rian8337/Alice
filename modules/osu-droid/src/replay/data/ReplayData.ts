import { CursorData } from "./CursorData";
import { ReplayObjectData } from "./ReplayObjectData";

export interface ReplayInformation {
    replayVersion: number;
    folderName: string;
    fileName: string;
    hash: string;
    time?: number;
    hit300k?: number;
    hit300?: number;
    hit100k?: number;
    hit100?: number;
    hit50?: number;
    hit0?: number;
    score?: number;
    maxCombo?: number;
    accuracy?: number;
    isFullCombo?: number;
    playerName?: string;
    rawMods?: string;
    droidMods?: string;
    convertedMods?: string;
    speedModForceAR?: string;
    cursorMovement: CursorData[];
    hitObjectData: ReplayObjectData[];
}

/**
 * Represents a replay data in an osu!droid replay.
 * 
 * Stores generic information about an osu!droid replay such as player name, MD5 hash, time set, etc.
 * 
 * This is used when analyzing replays using replay analyzer.
 */
export class ReplayData {
    /**
     * The version of the replay.
     */
    readonly replayVersion: number;

    /**
     * The folder name containing the beatmap played.
     */
    readonly folderName: string;

    /**
     * The file name of the beatmap played.
     */
    readonly fileName: string;

    /**
     * MD5 hash of the replay.
     */
    readonly hash: string;

    /**
     * The date of which the play was set.
     * 
     * Only available in replay v3 or later.
     */
    readonly time: Date;

    /**
     * The amount of geki and 300 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     */
    readonly hit300k: number;

    /**
     * The amount of 300s achieved in the play.
     */
    readonly hit300: number;

    /**
     * The amount of 100 katu achieved in the play. See {@link https://osu.ppy.sh/help/wiki/Score this} osu! wiki page for more information.
     */
    readonly hit100k: number;

    /**
     * The amount of 100s achieved in the play.
     */
    readonly hit100: number;

    /**
     * The amount of 50s achieved in the play.
     */
    readonly hit50: number;

    /**
     * The amount of misses achieved in the play.
     */
    readonly hit0: number;

    /**
     * The total score achieved in the play.
     * 
     * Only available in replay v3 or later.
     */
    readonly score: number;

    /**
     * The maximum combo achieved in the play.
     * 
     * Only available in replay v3 or later.
     */
    readonly maxCombo: number;

    /**
     * The accuracy achieved in the play.
     * 
     * Only available in replay v3 or later.
     */
    readonly accuracy: number;

    /**
     * Whether or not the play achieved the beatmap's maximum combo (1 for `true`, 0 for `false`).
     * 
     * Only available in replay v3 or later.
     */
    readonly isFullCombo: number;

    /**
     * The name of the player in the replay.
     * 
     * Only available in replay v3 or later.
     */
    readonly playerName: string;

    /**
     * Enabled modifications during the play in raw Java object format.
     * 
     * Only available in replay v3 or later.
     */
    readonly rawMods: string;

    /**
     * Enabled modifications during the play in osu!droid format.
     * 
     * Only available in replay v3 or later.
     */
    readonly droidMods: string;

    /**
     * Enabled modifications during the play in osu!standard format.
     * 
     * Only available in replay v3 or later.
     */
    readonly convertedMods: string;

    /**
     * The speed modification of the replay.
     * 
     * Only available in replay v4 or later. By default this is 1.
     */
    readonly speedModification: number;

    /**
     * The forced AR of the replay.
     * 
     * Only available in replay v4 or later.
     */
    readonly forcedAR?: number;

    /**
     * The cursor movement data of the replay.
     */
    readonly cursorMovement: CursorData[];

    /**
     * The hit object data of the replay.
     */
    readonly hitObjectData: ReplayObjectData[];

    constructor(values: ReplayInformation) {
        this.replayVersion = values.replayVersion;
        this.folderName = values.folderName;
        this.fileName = values.fileName;
        this.hash = values.hash;
        this.time = new Date(values.time || 0);
        this.hit300k = values.hit300k || 0;
        this.hit300 = values.hit300 || 0;
        this.hit100k = values.hit100k || 0;
        this.hit100 = values.hit100 || 0;
        this.hit50 = values.hit50 || 0;
        this.hit0 = values.hit0 || 0;
        this.score = values.score || 0;
        this.maxCombo = values.maxCombo || 0;
        this.accuracy = values.accuracy || 0;
        this.isFullCombo = values.isFullCombo || 0;
        this.playerName = values.playerName || "";
        this.rawMods = values.rawMods || "";
        this.droidMods = values.droidMods || "";
        this.convertedMods = values.convertedMods || "";
        this.cursorMovement = values.cursorMovement;
        this.hitObjectData = values.hitObjectData;

        const s = values.speedModForceAR?.split("|") || "";
        this.speedModification = parseFloat(s[0].replace("x", "")) || 1;
        if (s.length > 1) {
            this.forcedAR = parseFloat(s[1].replace("AR", ""));
        }
    }
}