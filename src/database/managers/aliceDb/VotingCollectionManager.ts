import { Voting } from "@alice-database/utils/aliceDb/Voting";
import { DatabaseVoting } from "@alice-interfaces/database/aliceDb/DatabaseVoting";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";
import { Snowflake } from "discord.js";

/**
 * A manager for the `voting` collection.
 */
export class VotingCollectionManager extends DatabaseCollectionManager<DatabaseVoting, Voting> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseVoting, Voting>;

    get defaultDocument(): DatabaseVoting {
        return {
            channel: "",
            choices: [],
            initiator: "",
            topic: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseVoting>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseVoting, Voting>> new Voting(client, this.defaultDocument).constructor
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