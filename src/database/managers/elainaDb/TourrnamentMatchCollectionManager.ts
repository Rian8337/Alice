import { TournamentMatch } from "@alice-database/utils/elainaDb/TournamentMatch";
import { DatabaseTournamentMatch } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMatch";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `matchinfo` command.
 */
export class TournamentMatchCollectionManager extends DatabaseCollectionManager<DatabaseTournamentMatch, TournamentMatch> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseTournamentMatch, TournamentMatch>;
    get defaultDocument(): DatabaseTournamentMatch {
        return {
            matchid: "",
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
}