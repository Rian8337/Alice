import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { Collection } from "discord.js";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { MapWhitelist } from "@alice-database/utils/elainaDb/MapWhitelist";
import { WhitelistValidity } from "@alice-enums/utils/WhitelistValidity";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { ScanLocalization } from "@alice-localization/interactions/commands/Bot Creators/scan/ScanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { consola } from "consola";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.channel?.isSendable()) {
        return;
    }

    const localization = new ScanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const whitelistDb = DatabaseManager.elainaDb.collections.mapWhitelist;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("scanStarted"),
        ),
    });

    let scannedCount = 0;

    let entries: Collection<number, MapWhitelist>;

    while ((entries = await whitelistDb.getUnscannedBeatmaps(250)).size) {
        for (const entry of entries.values()) {
            const validity = await entry.checkValidity();

            switch (validity) {
                case WhitelistValidity.beatmapNotFound:
                case WhitelistValidity.doesntNeedWhitelisting:
                    await DPPHelper.deletePlays(entry.hashid);

                    await whitelistDb.deleteOne({ mapid: entry.mapid });
                    break;
                case WhitelistValidity.outdatedHash: {
                    await DPPHelper.deletePlays(entry.hashid);

                    const beatmapInfo = (await BeatmapManager.getBeatmap(
                        entry.mapid,
                        {
                            checkFile: false,
                        },
                    ))!;

                    entry.hashid = beatmapInfo.hash;
                }
                // eslint-disable-next-line no-fallthrough
                case WhitelistValidity.valid:
                    consola.info(++scannedCount);

                    await HelperFunctions.sleep(0.05);

                    await whitelistDb.updateOne(
                        { mapid: entry.mapid },
                        {
                            $set: {
                                diffstat: entry.diffstat,
                                hashid: entry.hashid,
                                whitelistScanDone: true,
                            },
                        },
                    );
            }
        }
    }

    await whitelistDb.updateMany({}, { $unset: { whitelistScanDone: "" } });

    interaction.channel.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("scanComplete"),
            interaction.user.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BotOwner"],
};
