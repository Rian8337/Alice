import { DatabaseManager } from "@database/DatabaseManager";
import { officialPool } from "@database/official/OfficialDatabasePool";
import { constructOfficialDatabaseTable, OfficialDatabaseTables } from "@database/official/OfficialDatabaseTables";
import { OfficialDatabaseBeatmapDifficulty } from "@database/official/schema/OfficialDatabaseBeatmapDifficulty";
import {
    Accuracy,
    BeatmapDifficulty,
    DroidScoreMultiplierCalculator,
    ModMap,
    ModUtil,
    ScoreRank
} from "@rian8337/osu-base";
import {
    DroidDifficultyAttributes,
    OsuDifficultyAttributes,
} from "@rian8337/osu-difficulty-calculator";
import { HitErrorInformation } from "@rian8337/osu-droid-replay-analyzer";
import { DatabaseRecentPlay } from "@structures/database/aliceDb/DatabaseRecentPlay";
import { CompleteCalculationAttributes } from "@structures/difficultyattributes/CompleteCalculationAttributes";
import { DroidPerformanceAttributes } from "@structures/difficultyattributes/DroidPerformanceAttributes";
import { OsuPerformanceAttributes } from "@structures/difficultyattributes/OsuPerformanceAttributes";
import { SliderTickInformation } from "@structures/pp/SliderTickInformation";
import { Manager } from "@utils/base/Manager";
import { RowDataPacket } from "mysql2";

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
    readonly rank: ScoreRank;

    /**
     * The date of which this play was set.
     */
    readonly date: Date;

    /**
     * The accuracy achieved in this play.
     */
    readonly accuracy: Accuracy;

    /**
     * Enabled modifications in this play.
     */
    readonly mods: ModMap;

    /**
     * The MD5 hash of the beatmap in this play.
     */
    readonly hash: string;

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
     * The complete mod string of this play.
     */
    get completeModString(): string {
        if (this.mods.isEmpty) {
            return `+No Mod`;
        }

        return `+${ModUtil.modsToOrderedString(this.mods)}`;
    }

    private scoreMultiplier: number | null = null;

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
        this.mods = ModUtil.deserializeMods(data.mods);
        this.hash = data.hash;
        this.hitError = data.hitError;
        this.sliderTickInformation = data.sliderTickInformation;
        this.sliderEndInformation = data.sliderEndInformation;
        this.droidAttribs = data.droidAttribs;
        this.osuAttribs = data.osuAttribs;
        this.scoreId = data.scoreId;

        // Remove non-playable mods.
        for (const [modType, mod] of this.mods) {
            if (!mod.userPlayable) {
                this.mods.delete(modType);
            }
        }
    }

    /**
     * Obtains the total score of this play, which is the score after applying the score multiplier.
     */
    async getTotalScore(): Promise<number> {
        if (this.scoreMultiplier === null) {
            const difficultyMetadata = await officialPool.query<RowDataPacket[]>(
                `SELECT * FROM ${constructOfficialDatabaseTable(OfficialDatabaseTables.beatmapDifficulty)} WHERE beatmap_hash = ? LIMIT 1`,
                [this.hash],
            ).then(rows => rows[0].at(0) as OfficialDatabaseBeatmapDifficulty | undefined);

            let calculator: DroidScoreMultiplierCalculator;

            if (difficultyMetadata) {
                const difficulty = new BeatmapDifficulty();

                difficulty.cs = difficultyMetadata.circle_size;
                difficulty.ar = difficultyMetadata.approach_rate;
                difficulty.od = difficultyMetadata.overall_difficulty;
                difficulty.hp = difficultyMetadata.hp_drain;

                calculator = new DroidScoreMultiplierCalculator(difficulty);
            } else {
                calculator = new DroidScoreMultiplierCalculator(null);
            }

            this.scoreMultiplier = calculator.calculateFor(this.mods.values());
        }

        return Math.round(this.score * this.scoreMultiplier);
    }
}
