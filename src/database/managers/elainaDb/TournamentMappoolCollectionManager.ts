import { TournamentMappool } from "@alice-database/utils/elainaDb/TournamentMappool";
import { DatabaseTournamentMappool } from "structures/database/elainaDb/DatabaseTournamentMappool";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `mapinfo` collection.
 */
export class TournamentMappoolCollectionManager extends DatabaseCollectionManager<
    DatabaseTournamentMappool,
    TournamentMappool
> {
    protected override readonly utilityInstance: new (
        data: DatabaseTournamentMappool
    ) => TournamentMappool = TournamentMappool;

    override get defaultDocument(): DatabaseTournamentMappool {
        return {
            poolId: "",
            maps: [],
        };
    }

    /**
     * Gets a tournament mappool from its id.
     *
     * @param id The ID of the mappool.
     * @returns The mappool, `null` if not found.
     */
    getFromId(id: string): Promise<TournamentMappool | null> {
        return this.getOne({ poolId: id });
    }
}
