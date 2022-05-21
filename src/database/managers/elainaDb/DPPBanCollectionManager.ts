import { DPPBan } from "@alice-database/utils/elainaDb/DPPBan";
import { DatabaseDPPBan } from "@alice-interfaces/database/elainaDb/DatabaseDPPBan";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `dppban` collection.
 */
export class DPPBanCollectionManager extends DatabaseCollectionManager<
    DatabaseDPPBan,
    DPPBan
> {
    protected override readonly utilityInstance: new (
        data: DatabaseDPPBan
    ) => DPPBan = DPPBan;

    override get defaultDocument(): DatabaseDPPBan {
        return {
            uid: 0,
            reason: "",
        };
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
