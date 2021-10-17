import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Snowflake } from "discord.js";
import { recalcStrings } from "../recalcStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    let calculatedCount: number = 0;

    await interaction.editReply({
        content: MessageCreator.createAccept(recalcStrings.fullRecalcInProgress)
    });

    while (true) {
        const players: Collection<Snowflake, UserBind> = await dbManager.getRecalcUnscannedPlayers(20);

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