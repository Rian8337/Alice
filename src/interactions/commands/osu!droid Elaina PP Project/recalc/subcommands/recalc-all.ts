import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { RecalcLocalization } from "@alice-localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Message } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: RecalcLocalization = new RecalcLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcInProgress")
        ),
    });

    let calculatedCount: number =
        await dbManager.getRecalcCalculatedPlayerCount();

    const uncalculatedCount: number =
        await dbManager.getRecalcUncalculatedPlayerCount();

    const total: number = calculatedCount + uncalculatedCount;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    const message: Message = await interaction.channel!.send({
        content: MessageCreator.createWarn(
            localization.getTranslation("fullRecalcTrackProgress"),
            calculatedCount.toLocaleString(BCP47),
            total.toLocaleString(BCP47),
            ((calculatedCount * 100) / total).toFixed(2)
        ),
    });

    let player: UserBind | undefined;

    while (
        (player = (
            await dbManager.getRecalcUnscannedPlayers(1, {
                projection: {
                    _id: 0,
                    pp: 1,
                    previous_bind: 1,
                    calculationInfo: 1,
                },
            })
        ).first())
    ) {
        client.logger.info(`Now calculating ID ${player.discordid}`);

        if (interaction.options.getBoolean("full")) {
            await player.recalculateAllScores(false, true);
        } else {
            await player.recalculateDPP();
        }

        client.logger.info(`${++calculatedCount} players recalculated`);

        await message.edit({
            content: MessageCreator.createWarn(
                localization.getTranslation("fullRecalcTrackProgress"),
                calculatedCount.toLocaleString(BCP47),
                total.toLocaleString(BCP47),
                ((calculatedCount * 100) / total).toFixed(2)
            ),
        });
    }

    await dbManager.updateMany({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString()
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
