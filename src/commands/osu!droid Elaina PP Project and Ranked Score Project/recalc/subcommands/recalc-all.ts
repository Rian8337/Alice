import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Message, Snowflake } from "discord.js";
import { recalcStrings } from "../recalcStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    let calculatedCount: number = 0;

    await interaction.editReply({
        content: MessageCreator.createAccept(recalcStrings.fullRecalcInProgress)
    });

    const uncalculatedCount: number = await dbManager.getRecalcUncalculatedPlayerCount();

    const message: Message = await interaction.channel!.send({
        content: MessageCreator.createWarn(
            recalcStrings.fullRecalcTrackProgress, "0", uncalculatedCount.toLocaleString(), "0.00"
        )
    });

    while (true) {
        const players: Collection<Snowflake, UserBind> = await dbManager.getRecalcUnscannedPlayers(5);

        if (players.size === 0) {
            break;
        }

        for await (const player of players.values()) {
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
                    uncalculatedCount.toLocaleString(),
                    (calculatedCount * 100 / uncalculatedCount).toFixed(2)
                )
            });
        }
    }

    await dbManager.update({}, { $unset: { dppScanComplete: "" } });

    interaction.channel!.send({
        content: MessageCreator.createAccept(
            recalcStrings.fullRecalcSuccess, interaction.user.toString()
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"]
};