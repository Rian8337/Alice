import { DatabaseManager } from "@alice-database/DatabaseManager";
import { WhitelistValidity } from "@alice-enums/utils/WhitelistValidity";
import { DatabaseMapWhitelist } from "@alice-interfaces/database/elainaDb/DatabaseMapWhitelist";
import { WhitelistDifficultyStatistics } from "@alice-interfaces/dpp/WhitelistDifficultyStatistics";
import { Manager } from "@alice-utils/base/Manager";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { WhitelistManager } from "@alice-utils/managers/WhitelistManager";
import { ObjectId } from "bson";
import { MapInfo } from "osu-droid";

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
        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            this.hashid,
            false,
            true
        );

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
     */
    async updateDiffstat(): Promise<void> {
        const beatmapInfo: MapInfo | null = await BeatmapManager.getBeatmap(
            this.hashid,
            false
        );

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
