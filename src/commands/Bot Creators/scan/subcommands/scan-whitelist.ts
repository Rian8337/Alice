import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { Collection } from "discord.js";
import { scanStrings } from "../scanStrings";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { MapWhitelistCollectionManager } from "@alice-database/managers/elainaDb/MapWhitelistCollectionManager";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { WhitelistValidity } from "@alice-enums/utils/WhitelistValidity";
import { MapInfo } from "osu-droid";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";

/**
 * Deletes a beatmap with specific hash from all players.
 * 
 * @param bindDb The database collection that stores dpp.
 * @param hash The beatmap's hash.
 */
async function deletePlays(hash: string): Promise<void> {
    const toUpdateList: Collection<string, UserBind> = await DatabaseManager.elainaDb.collections.userBind.get(
        "discordid",
        { "pp.hash": hash },
        { projection: { _id: 0, pp: 1, playc: 1 } }
    );

    for await (const toUpdate of toUpdateList.values()) {
        toUpdate.pp.delete(hash);

        await DatabaseManager.elainaDb.collections.userBind.update(
            { discordid: toUpdate.discordid },
            {
                $set: {
                    pp: [...toUpdate.pp.values()],
                    pptotal: DPPHelper.calculateFinalPerformancePoints(toUpdate.pp),
                    playc: Math.max(0, toUpdate.playc - 1)
                }
            }
        );
    }
}

export const run: Subcommand["run"] = async (client, interaction) => {
    const whitelistDb: MapWhitelistCollectionManager = DatabaseManager.elainaDb.collections.mapWhitelist;

    await interaction.editReply({
        content: MessageCreator.createAccept(scanStrings.scanStarted)
    });

    let scannedCount: number = 0;

    while (true) {
        const entries: Collection<number, MapWhitelist> = await whitelistDb.getUnscannedBeatmaps(250);

        if (entries.size === 0) {
            break;
        }

        for await (const entry of entries.values()) {
            const validity: WhitelistValidity = await entry.checkValidity();

            switch (validity) {
                case WhitelistValidity.BEATMAP_NOT_FOUND:
                case WhitelistValidity.DOESNT_NEED_WHITELISTING:
                    await deletePlays(entry.hashid);

                    await whitelistDb.delete({ mapid: entry.mapid });
                    break;
                case WhitelistValidity.OUTDATED_HASH:
                    await deletePlays(entry.hashid);

                    const beatmapInfo: MapInfo = (await BeatmapManager.getBeatmap(entry.mapid, false))!;

                    entry.hashid = beatmapInfo.hash;
                case WhitelistValidity.VALID:
                    client.logger.info(++scannedCount);

                    await HelperFunctions.sleep(0.05);

                    await whitelistDb.update(
                        { mapid: entry.mapid },
                        {
                            $set: {
                                diffstat: entry.diffstat,
                                hashid: entry.hashid,
                                whitelistScanDone: true
                            }
                        }
                    );
            }
        }
    }

    await whitelistDb.update({}, { $unset: { whitelistScanDone: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(scanStrings.scanComplete, interaction.user.toString())
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"]
};