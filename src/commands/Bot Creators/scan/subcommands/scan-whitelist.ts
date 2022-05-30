import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { Collection } from "discord.js";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { MapWhitelistCollectionManager } from "@alice-database/managers/elainaDb/MapWhitelistCollectionManager";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { WhitelistValidity } from "@alice-enums/utils/WhitelistValidity";
import { MapInfo } from "@rian8337/osu-base";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { ScanLocalization } from "@alice-localization/commands/Bot Creators/scan/ScanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const localization: ScanLocalization = new ScanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const whitelistDb: MapWhitelistCollectionManager =
        DatabaseManager.elainaDb.collections.mapWhitelist;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("scanStarted")
        ),
    });

    let scannedCount: number = 0;

    let entries: Collection<number, MapWhitelist>;

    while ((entries = await whitelistDb.getUnscannedBeatmaps(250)).size) {
        for (const entry of entries.values()) {
            const validity: WhitelistValidity = await entry.checkValidity();

            switch (validity) {
                case WhitelistValidity.BEATMAP_NOT_FOUND:
                case WhitelistValidity.DOESNT_NEED_WHITELISTING:
                    await DPPHelper.deletePlays(entry.hashid);

                    await whitelistDb.delete({ mapid: entry.mapid });
                    break;
                case WhitelistValidity.OUTDATED_HASH: {
                    await DPPHelper.deletePlays(entry.hashid);

                    const beatmapInfo: MapInfo =
                        (await BeatmapManager.getBeatmap(entry.mapid, false))!;

                    entry.hashid = beatmapInfo.hash;
                }
                // eslint-disable-next-line no-fallthrough
                case WhitelistValidity.VALID:
                    client.logger.info(++scannedCount);

                    await HelperFunctions.sleep(0.05);

                    await whitelistDb.update(
                        { mapid: entry.mapid },
                        {
                            $set: {
                                diffstat: entry.diffstat,
                                hashid: entry.hashid,
                                whitelistScanDone: true,
                            },
                        }
                    );
            }
        }
    }

    await whitelistDb.update({}, { $unset: { whitelistScanDone: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("scanComplete"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
