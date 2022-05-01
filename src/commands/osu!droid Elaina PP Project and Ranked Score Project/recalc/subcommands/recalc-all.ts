import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { RecalcLocalization } from "@alice-localization/commands/osu!droid Elaina PP Project and Ranked Score Project/recalc/RecalcLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { Message } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: RecalcLocalization = new RecalcLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    await interaction.editReply({
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

    while ((player = (await dbManager.getRecalcUnscannedPlayers(1)).first())) {
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

    await dbManager.update({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            localization.getTranslation("fullRecalcSuccess"),
            interaction.user.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
