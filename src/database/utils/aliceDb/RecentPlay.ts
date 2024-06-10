import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseRecentPlay } from "@alice-structures/database/aliceDb/DatabaseRecentPlay";
import { CompleteCalculationAttributes } from "@alice-structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@alice-structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@alice-structures/difficultyattributes/OsuPerformanceAttributes";
import { SliderTickInformation } from "@alice-structures/dpp/SliderTickInformation";
import { Manager } from "@alice-utils/base/Manager";
import {
    Accuracy,
    IModApplicableToDroid,
    Mod,
    ModUtil,
} from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import { HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";

/**
 * Represents a recent play.
 */
export class RecentPlay extends Manager {
    /**
     * The uid of the player who submitted ths play.
     */
    readonly uid: number;

    /**
     * The title of the beatmap in this play.
     */
    readonly title: string;

    /**
     * The maximum combo achieved in this play.
     */
    readonly combo: number;

    /**
     * The score achieved in this play.
     */
    readonly score: number;

    /**
     * The rank achieved in this play.
     */
    readonly rank: string;

    /**
     * The date of which this play was set.
     */
    readonly date: Date;

    /**
     * The accuracy achieved in this play.
     */
    readonly accuracy: Accuracy;

    /**
     * Enabled modifications in this play, in osu!standard string.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The MD5 hash of the beatmap in this play.
     */
    readonly hash: string;

    /**
     * The speed multiplier of this play. Should default to 1.
     */
    readonly speedMultiplier?: number;

    /**
     * The force CS of this play.
     */
    readonly forceCS?: number;

    /**
     * The force AR of this play.
     */
    readonly forceAR?: number;

    /**
     * The force OD of this play.
     */
    readonly forceOD?: number;

    /**
     * The force HP of this play.
     */
    readonly forceHP?: number;

    /**
     * Information about this play's hit error.
     */
    readonly hitError?: HitErrorInformation;

    /**
     * Information about this play's slider tick collection.
     */
    readonly sliderTickInformation?: SliderTickInformation;

    /**
     * Information about this play's slider end collection.
     */
    readonly sliderEndInformation?: SliderTickInformation;

    /**
     * The osu!droid difficulty attributes of this play.
     */
    readonly droidAttribs?: CompleteCalculationAttributes<
        DroidDifficultyAttributes,
        DroidPerformanceAttributes
    >;

    /**
     * The osu!standard difficulty attributes of this play.
     */
    readonly osuAttribs?: CompleteCalculationAttributes<
        OsuDifficultyAttributes,
        OsuPerformanceAttributes
    >;

    /**
     * The ID of this play, if it was submitted to the game server.
     */
    readonly scoreId?: number;

    /**
     * The complete mod string of this play (mods, speed multiplier, and force AR combined).
     */
    get completeModString(): string {
        let finalString: string = `+${
            this.mods.length > 0 ? this.mods.map((v) => v.acronym) : "No Mod"
        }`;

        const customStats: string[] = [];

        if (this.speedMultiplier !== undefined && this.speedMultiplier !== 1) {
            customStats.push(`${this.speedMultiplier}x`);
        }

        if (this.forceCS !== undefined) {
            customStats.push(`CS${this.forceCS}`);
        }

        if (this.forceAR !== undefined) {
            customStats.push(`AR${this.forceAR}`);
        }

        if (this.forceOD !== undefined) {
            customStats.push(`OD${this.forceOD}`);
        }

        if (this.forceHP !== undefined) {
            customStats.push(`HP${this.forceHP}`);
        }

        if (customStats.length > 0) {
            finalString += ` (${customStats.join(", ")})`;
        }

        return finalString;
    }

    constructor(
        data: DatabaseRecentPlay = DatabaseManager.aliceDb?.collections
            .recentPlays.defaultDocument ?? {},
    ) {
        super();

        this.uid = data.uid;
        this.title = data.title;
        this.combo = data.combo;
        this.score = data.score;
        this.rank = data.rank;
        this.date = data.date;
        this.accuracy = new Accuracy(data.accuracy);
        this.mods = <(Mod & IModApplicableToDroid)[]>(
            ModUtil.pcStringToMods(data.mods)
        );
        this.hash = data.hash;
        this.speedMultiplier = data.speedMultiplier;
        this.forceCS = data.forceCS;
        this.forceAR = data.forceAR;
        this.forceOD = data.forceOD;
        this.forceHP = data.forceHP;
        this.hitError = data.hitError;
        this.sliderTickInformation = data.sliderTickInformation;
        this.sliderEndInformation = data.sliderEndInformation;
        this.droidAttribs = data.droidAttribs;
        this.osuAttribs = data.osuAttribs;
        this.scoreId = data.scoreId;
    }
}
