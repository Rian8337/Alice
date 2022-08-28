import { DatabaseManager } from "@alice-database/DatabaseManager";
import { WhitelistValidity } from "@alice-enums/utils/WhitelistValidity";
import { DatabaseMapWhitelist } from "structures/database/elainaDb/DatabaseMapWhitelist";
import { WhitelistDifficultyStatistics } from "structures/dpp/WhitelistDifficultyStatistics";
import { Manager } from "@alice-utils/base/Manager";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
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
            .mapWhitelist.defaultDocument ?? {}
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
            return WhitelistValidity.BEATMAP_NOT_FOUND;
        }

        if (this.hashid !== beatmapInfo.hash) {
            await this.updateDiffstat();

            return WhitelistValidity.OUTDATED_HASH;
        }

        if (!WhitelistManager.beatmapNeedsWhitelisting(beatmapInfo.approved)) {
            return WhitelistValidity.DOESNT_NEED_WHITELISTING;
        }

        return WhitelistValidity.VALID;
    }

    /**
     * Updates the diffstat of this whitelisted beatmap.
     *
     * Note that this will not update the beatmap statistics in database.
     */
    async updateDiffstat(): Promise<void> {
        const beatmapInfo: MapInfo<false> | null =
            await BeatmapManager.getBeatmap(this.hashid, {
                checkFile: false,
                cacheBeatmap: false,
            });

        if (!beatmapInfo) {
            return;
        }

        this.diffstat = {
            cs: beatmapInfo.cs,
            ar: beatmapInfo.ar,
            od: beatmapInfo.od,
            hp: beatmapInfo.hp,
            sr: parseFloat(beatmapInfo.totalDifficulty.toFixed(2)),
            bpm: beatmapInfo.bpm,
        };
    }
}
