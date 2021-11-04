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
    const channel: TextChannel = <TextChannel> await client.channels.fetch("549109230284701718");

    const message: Message = await channel.messages.fetch("905658272810426378");

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    let calculatedCount: number = await dbManager.getRecalcCalculatedPlayerCount();

    const uncalculatedCount: number = await dbManager.getRecalcUncalculatedPlayerCount();

    CommandUtilManager.globalCommandCooldown = 5;

    const total: number = calculatedCount + uncalculatedCount;

    let player: UserBind | undefined;

    const msg: string = "Recalculating players (%s/%s (%s%))...\nCurrently calculating <@%s> (uid: %s)";

    while (player = (await dbManager.getRecalcUnscannedPlayers(1)).first()) {
        await message.edit({
            content: MessageCreator.createWarn(
                msg,
                calculatedCount.toLocaleString(),
                total.toLocaleString(),
                (calculatedCount * 100 / total).toFixed(2),
                player.discordid,
                player.uid.toString()
            )
        });

        client.logger.info(`Now calculating ID ${player.discordid}`);

        await player.recalculateAllScores(false, true);

        client.logger.info(`${++calculatedCount} players recalculated`);
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for resuming ongoing calculation.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};