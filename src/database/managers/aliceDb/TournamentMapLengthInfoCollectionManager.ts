import { TournamentMapLengthInfo } from "@alice-database/utils/aliceDb/TournamentMapLengthInfo";
import { DatabaseTournamentMapLengthInfo } from "@alice-interfaces/database/aliceDb/DatabaseTournamentMapLengthInfo";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `mapinfolength` collection.
 */
export class TournamentMapLengthInfoCollectionManager extends DatabaseCollectionManager<DatabaseTournamentMapLengthInfo, TournamentMapLengthInfo> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseTournamentMapLengthInfo, TournamentMapLengthInfo>;

    get defaultDocument(): DatabaseTournamentMapLengthInfo {
        return {
            map: [],
            poolid: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseTournamentMapLengthInfo>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseTournamentMapLengthInfo, TournamentMapLengthInfo>> new TournamentMapLengthInfo(client, this.defaultDocument).constructor
    }
}