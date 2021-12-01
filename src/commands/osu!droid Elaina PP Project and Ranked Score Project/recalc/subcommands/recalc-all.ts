import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Message } from "discord.js";
import { recalcStrings } from "../recalcStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    await interaction.editReply({
        content: MessageCreator.createAccept(
            recalcStrings.fullRecalcInProgress
        ),
    });

    let calculatedCount: number =
        await dbManager.getRecalcCalculatedPlayerCount();

    const uncalculatedCount: number =
        await dbManager.getRecalcUncalculatedPlayerCount();

    const total: number = calculatedCount + uncalculatedCount;

    const message: Message = await interaction.channel!.send({
        content: MessageCreator.createWarn(
            recalcStrings.fullRecalcTrackProgress,
            calculatedCount.toLocaleString(),
            total.toLocaleString(),
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
                recalcStrings.fullRecalcTrackProgress,
                calculatedCount.toLocaleString(),
                total.toLocaleString(),
                ((calculatedCount * 100) / total).toFixed(2)
            ),
        });
    }

    await dbManager.update({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            recalcStrings.fullRecalcSuccess,
            interaction.user.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
