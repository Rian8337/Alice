import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { DatabaseOldPPProfile } from "@alice-structures/database/aliceDb/DatabaseOldPPProfile";
import { OldPPEntry } from "@alice-structures/dpp/OldPPEntry";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { Collection, Snowflake } from "discord.js";

export class OldPPProfile extends Manager {
    /**
     * The Discord ID of the user.
     */
    discordId: Snowflake;

    /**
     * The UID of the osu!droid account binded to the user.
     */
    uid: number;

    /**
     * The username of the osu!droid account binded to the user.
     */
    username: string;

    /**
     * The total droid performance points (dpp) that the user has.
     */
    pptotal: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;

    /**
     * The weighted accuracy of the player.
     */
    weightedAccuracy: number;

    /**
     * The droid performance points entries of the user.
     */
    pp: Collection<string, OldPPEntry>;

    /**
     * The UID of osu!droid accounts that are binded to the user.
     *
     * A user can only bind up to 2 osu!droid accounts, therefore
     * the maximum length of this array will never exceed 2.
     */
    previous_bind: number[];

    constructor(
        data: DatabaseOldPPProfile = DatabaseManager.aliceDb?.collections
            .playerOldPPProfile.defaultDocument ?? {}
    ) {
        super();

        this.discordId = data.discordId;
        this.uid = data.uid;
        this.username = data.username;
        this.pptotal = data.pptotal;
        this.playc = data.playc;
        this.weightedAccuracy = data.weightedAccuracy;
        this.pp = ArrayHelper.arrayToCollection(data.pp, "hash");
        this.previous_bind = data.previous_bind;
    }

    /**
     * Sets the dpp list for the player to a new list.
     *
     * @param list The new list.
     * @param playCountIncrement The amount to increment towards play count.
     * @returns An object containing information about the operation.
     */
    async setNewDPPValue(
        list: Collection<string, OldPPEntry>,
        playCountIncrement: number
    ): Promise<OperationResult> {
        this.pp = list;

        this.pp.sort((a, b) => {
            return b.pp - a.pp;
        });

        this.playc += Math.max(0, playCountIncrement);

        this.weightedAccuracy = DPPHelper.calculateWeightedAccuracy(this.pp);

        const finalPP: number = DPPHelper.calculateFinalPerformancePoints(list);

        return DatabaseManager.aliceDb.collections.playerOldPPProfile.updateOne(
            { discordId: this.discordId },
            {
                $set: {
                    pptotal: finalPP,
                    pp: [...this.pp.values()],
                    weightedAccuracy: this.weightedAccuracy,
                },
                $inc: {
                    playc: Math.max(0, playCountIncrement),
                },
            }
        );
    }
}
