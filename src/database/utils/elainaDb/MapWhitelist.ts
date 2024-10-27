import { DatabaseManager } from "@database/DatabaseManager";
import { WhitelistValidity } from "@enums/utils/WhitelistValidity";
import { DatabaseMapWhitelist } from "structures/database/elainaDb/DatabaseMapWhitelist";
import { WhitelistDifficultyStatistics } from "structures/dpp/WhitelistDifficultyStatistics";
import { Manager } from "@utils/base/Manager";
import { BeatmapManager } from "@utils/managers/BeatmapManager";
import { WhitelistManager } from "@utils/managers/WhitelistManager";
import { ObjectId } from "bson";
import { MapInfo } from "@rian8337/osu-base";

/**
 * Represents a whitelisted beatmap.
 */
export class MapWhitelist extends Manager implements DatabaseMapWhitelist {
    mapid: number;
    hashid: string;
    mapname: string;
    diffstat: WhitelistDifficultyStatistics;
    whitelistScanDone?: boolean;
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseMapWhitelist = DatabaseManager.elainaDb?.collections
            .mapWhitelist.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.mapid = data.mapid;
        this.hashid = data.hashid;
        this.mapname = data.mapname;
        this.diffstat = data.diffstat;
    }

    /**
     * Checks whether this whitelisted beatmap is still valid.
     */
    async checkValidity(): Promise<WhitelistValidity> {
        const beatmapInfo: MapInfo<false> | null =
            await BeatmapManager.getBeatmap(this.hashid, {
                checkFile: false,
                cacheBeatmap: false,
            });

        if (!beatmapInfo) {
            return WhitelistValidity.beatmapNotFound;
        }

        if (this.hashid !== beatmapInfo.hash) {
            await this.updateDiffstat();

            return WhitelistValidity.outdatedHash;
        }

        if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
            return WhitelistValidity.doesntNeedWhitelisting;
        }

        return WhitelistValidity.valid;
    }

    /**
     * Updates the diffstat of this whitelisted beatmap.
     *
     * Note that this will not update the beatmap statistics in database.
     *
     * @returns Whether the update operation succeeded.
     */
    async updateDiffstat(): Promise<boolean> {
        const beatmapInfo: MapInfo<false> | null =
            await BeatmapManager.getBeatmap(this.hashid, {
                checkFile: false,
                cacheBeatmap: false,
            });

        if (!beatmapInfo || beatmapInfo.totalDifficulty === null) {
            return false;
        }

        this.diffstat = {
            cs: beatmapInfo.cs,
            ar: beatmapInfo.ar,
            od: beatmapInfo.od,
            hp: beatmapInfo.hp,
            sr: parseFloat(beatmapInfo.totalDifficulty.toFixed(2)),
            bpm: beatmapInfo.bpm,
        };

        return true;
    }
}
