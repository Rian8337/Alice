import { TournamentMapLengthInfo } from "@alice-database/utils/aliceDb/TournamentMapLengthInfo";
import { DatabaseTournamentMapLengthInfo } from "@alice-interfaces/database/aliceDb/DatabaseTournamentMapLengthInfo";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `mapinfolength` collection.
 */
export class TournamentMapLengthInfoCollectionManager extends DatabaseCollectionManager<
    DatabaseTournamentMapLengthInfo,
    TournamentMapLengthInfo
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseTournamentMapLengthInfo,
        TournamentMapLengthInfo
    >;

    override get defaultDocument(): DatabaseTournamentMapLengthInfo {
        return {
            map: [],
            poolid: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(
        collection: MongoDBCollection<DatabaseTournamentMapLengthInfo>
    ) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<
                DatabaseTournamentMapLengthInfo,
                TournamentMapLengthInfo
            >
        >new TournamentMapLengthInfo().constructor;
    }

    /**
     * Gets a tournament mappool from its id.
     *
     * @param id The ID of the mappool.
     * @returns The mappool, `null` if not found.
     */
    getFromId(id: string): Promise<TournamentMapLengthInfo | null> {
        return this.getOne({ poolid: id });
    }
}
