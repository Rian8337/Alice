import { DPPBan } from "@alice-database/utils/elainaDb/DPPBan";
import { DatabaseDPPBan } from "@alice-interfaces/database/elainaDb/DatabaseDPPBan";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";

/**
 * A manager for the `dppban` collection.
 */
export class DPPBanCollectionManager extends DatabaseCollectionManager<
    DatabaseDPPBan,
    DPPBan
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseDPPBan,
        DPPBan
    >;

    override get defaultDocument(): DatabaseDPPBan {
        return {
            uid: 0,
            reason: "",
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseDPPBan>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseDPPBan, DPPBan>
        >new DPPBan().constructor;
    }

    /**
     * Checks whether a uid is dpp-banned.
     *
     * @param uid The uid to check.
     * @returns Whether the uid is dpp-banned.
     */
    async isPlayerBanned(uid: number): Promise<boolean> {
        return !!(await this.getOne({ uid: uid }));
    }
}
