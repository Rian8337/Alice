import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { DatabaseVoting } from "@alice-interfaces/database/aliceDb/DatabaseVoting";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Snowflake } from "discord.js";

/**
 * A manager for the `voting` collection.
 */
export class VotingCollectionManager extends DatabaseCollectionManager<
    DatabaseVoting,
    Voting
> {
    protected override readonly utilityInstance: new (
        data: DatabaseVoting
    ) => Voting = Voting;

    override get defaultDocument(): DatabaseVoting {
        return {
            channel: "",
            choices: [],
            initiator: "",
            topic: "",
        };
    }

    /**
     * Gets a current ongoing vote in a channel.
     *
     * @param channelId The ID of the channel.
     */
    getCurrentVoteInChannel(channelId: Snowflake): Promise<Voting | null> {
        return this.getOne({ channel: channelId });
    }
}
