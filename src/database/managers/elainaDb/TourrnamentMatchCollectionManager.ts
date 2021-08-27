import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";
import { Snowflake } from "discord.js";

/**
 * A manager for the `matchinfo` command.
 */
export class TournamentMatchCollectionManager extends DatabaseCollectionManager<DatabaseTournamentMatch, TournamentMatch> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseTournamentMatch, TournamentMatch>;
    get defaultDocument(): DatabaseTournamentMatch {
        return {
            matchid: "",
            channelId: "",
            name: "",
            player: [],
            result: [],
            status: "scheduled",
            team: []
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseTournamentMatch>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseTournamentMatch, TournamentMatch>> new TournamentMatch(client, this.defaultDocument).constructor
    }

    /**
     * Gets a match by its ID.
     * 
     * @param id The ID of the match.
     * @returns The match, `null` if not found.
     */
    getById(id: string): Promise<TournamentMatch | null> {
        return this.getOne({ matchid: id });
    }

    /**
     * Gets a match by its binded channel.
     * 
     * @param channelId The ID of the channel.
     * @returns The match, `null` if not found.
     */
    getByChannel(channelId: Snowflake): Promise<TournamentMatch | null> {
        return this.getOne({ channelId: channelId });
    }
}