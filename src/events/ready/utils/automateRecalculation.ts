import { recalcStrings } from "@alice-commands/osu!droid Elaina PP Project and Ranked Score Project/recalc/recalcStrings";
import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Message, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch("546135349533868072")
    );

    const message: Message = await channel.messages.fetch("905354500380954644");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const uncalculatedCount: number =
        await dbManager.getRecalcUncalculatedPlayerCount();

    if (!uncalculatedCount) {
        return;
    }

    let calculatedCount: number =
        await dbManager.getRecalcCalculatedPlayerCount();

    const total: number = calculatedCount + uncalculatedCount;

    CommandUtilManager.globalCommandCooldown = 5;

    let player: UserBind | undefined;

    while ((player = (await dbManager.getRecalcUnscannedPlayers(1)).first())) {
        client.logger.info(`Now calculating ID ${player.discordid}`);

        await player.recalculateAllScores(false, true);

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

    channel.send({
        content: MessageCreator.createAccept(
            recalcStrings.fullRecalcSuccess,
            `<@${Config.botOwners[1]}>`
        ),
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for resuming ongoing calculation.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
