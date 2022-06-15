import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseIllegalMap } from "@alice-interfaces/database/aliceDb/DatabaseIllegalMap";
import { Manager } from "@alice-utils/base/Manager";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { DroidAPIRequestBuilder } from "@rian8337/osu-base";
import { Score } from "@rian8337/osu-droid-utilities";
import { ObjectId } from "mongodb";

/**
 * Represents a beatmap that is considered illegal.
 */
export class IllegalMap extends Manager implements DatabaseIllegalMap {
    hash: string;
    readonly _id?: ObjectId;
    deleteDone?: boolean;

    constructor(
        data: DatabaseIllegalMap = DatabaseManager.aliceDb?.collections
            .illegalMap.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.hash = data.hash;
        this.deleteDone = data.deleteDone;
    }

    /**
     * Scans for scores in this beatmap and deletes them if available.
     */
    async scanAndDelete(): Promise<OperationResult> {
        let scores: Score[];

        while (
            (scores = await ScoreHelper.fetchDroidLeaderboard(this.hash))
                .length > 0
        ) {
            for (const score of scores) {
                await new DroidAPIRequestBuilder()
                    .setEndpoint("banscore.php")
                    .addParameter("scoreid", score.scoreID)
                    .sendRequest();
            }
        }

        return DatabaseManager.aliceDb.collections.illegalMap.updateOne(
            { hash: this.hash },
            {
                $set: {
                    deleteDone: true,
                },
            }
        );
    }
}
