import { DPPBan } from "@alice-database/utils/elainaDb/DPPBan";
import { DatabaseDPPBan } from "@alice-interfaces/database/elainaDb/DatabaseDPPBan";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Bot } from "@alice-core/Bot";

/**
 * A manager for the `dppban` collection.
 */
export class DPPBanCollectionManager extends DatabaseCollectionManager<DatabaseDPPBan, DPPBan> {
    protected readonly utilityInstance: DatabaseUtilityConstructor<DatabaseDPPBan, DPPBan>;

    get defaultDocument(): DatabaseDPPBan {
        return {
            uid: 0,
            reason: ""
        };
    }

    constructor(client: Bot, collection: MongoDBCollection<DatabaseDPPBan>) {
        super(
            client,
            collection
        );

        this.utilityInstance = <DatabaseUtilityConstructor<DatabaseDPPBan, DPPBan>> new DPPBan(client, this.defaultDocument).constructor
    }

    /**
     * Checks whether a uid is dpp-banned.
     * 
     * @param uid The uid to check.
     * @returns Whether the uid is dpp-banned.
     */
    async isPlayerBanned(uid: number): Promise<boolean> {
        return !!await this.getOne({ uid: uid });
    }
}