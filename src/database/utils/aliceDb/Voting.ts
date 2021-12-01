import { DatabaseManager } from "@alice-database/DatabaseManager";
import { VoteChoice } from "@alice-interfaces/commands/Tools/VoteChoice";
import { DatabaseVoting } from "@alice-interfaces/database/aliceDb/DatabaseVoting";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents a voting entry.
 */
export class Voting extends Manager implements DatabaseVoting {
    initiator: Snowflake;
    topic: string;
    channel: Snowflake;
    choices: VoteChoice[];
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseVoting = DatabaseManager.aliceDb?.collections.voting
            .defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.initiator = data.initiator;
        this.topic = data.topic;
        this.channel = data.channel;
        this.choices = data.choices ?? [];
    }

    /**
     * Ends this vote.
     *
     * @returns An object containing information about the operation.
     */
    async end(): Promise<OperationResult> {
        return DatabaseManager.aliceDb.collections.voting.delete({
            channel: this.channel,
        });
    }
}
