import { DPPBan } from "@alice-database/utils/elainaDb/DPPBan";
import { DatabaseDPPBan } from "structures/database/elainaDb/DatabaseDPPBan";
import { FindOptions } from "mongodb";
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

    protected override processFindOptions(
        options?: FindOptions<DatabaseDPPBan>
    ): FindOptions<DatabaseDPPBan> | undefined {
        if (options?.projection) {
            options.projection.uid = 1;
        }

        return super.processFindOptions(options);
    }
}
