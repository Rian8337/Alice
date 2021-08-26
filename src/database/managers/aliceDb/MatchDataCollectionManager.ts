import { Bot } from "@alice-core/Bot";
import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { MatchData } from "@alice-database/utils/aliceDb/MatchData";
import { DatabaseMatchData } from "@alice-interfaces/database/aliceDb/DatabaseMatchData";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Collection as MongoDBCollection } from "mongodb";

/**
 * A manager for the `matchdata` collection.
 */
export class MatchDataCollectionManager extends DatabaseCollectionManager<DatabaseMatchData, MatchData> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseMatchData, MatchData>;

    get defaultDocument(): DatabaseMatchData {
        return {
            bans: [],
            matchid: "",
            players: [],
            result: [],
            scores: []
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseMatchData>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseMatchData, MatchData>> new MatchData(client, this.defaultDocument).constructor
    }

    /**
     * Gets a match data from its ID.
     * 
     * @param id The ID of the match.
     */
    getFromMatchId(id: string): Promise<MatchData | null> {
        return this.getOne({ matchid: id });
    }
}