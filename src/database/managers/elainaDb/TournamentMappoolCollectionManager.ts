import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `mapinfo` collection.
 */
export class TournamentMappoolCollectionManager extends DatabaseCollectionManager<DatabaseTournamentMappool, TournamentMappool> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseTournamentMappool, TournamentMappool>;
    get defaultDocument(): DatabaseTournamentMappool {
        return {
            forcePR: false,
            map: [],
            poolid: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseTournamentMappool>) {
        super(
            client,
            collection,
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseTournamentMappool, TournamentMappool>> new TournamentMappool(client, this.defaultDocument).constructor
    }
}