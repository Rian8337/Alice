import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { DatabaseTournamentMappool } from "@alice-interfaces/database/elainaDb/DatabaseTournamentMappool";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `mapinfo` collection.
 */
export class TournamentMappoolCollectionManager extends DatabaseCollectionManager<
    DatabaseTournamentMappool,
    TournamentMappool
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseTournamentMappool,
        TournamentMappool
    >;

    override get defaultDocument(): DatabaseTournamentMappool {
        return {
            forcePR: false,
            map: [],
            poolid: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseTournamentMappool>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<
                DatabaseTournamentMappool,
                TournamentMappool
            >
        >new TournamentMappool().constructor;
    }

    /**
     * Gets a tournament mappool from its id.
     *
     * @param id The ID of the mappool.
     * @returns The mappool, `null` if not found.
     */
    getFromId(id: string): Promise<TournamentMappool | null> {
        return this.getOne({ poolid: id });
    }
}
