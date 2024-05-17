import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { TextChannel } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: EventUtil["run"] = async (client) => {
    const channel = <TextChannel>(
        await client.channels.fetch("665106609382359041")
    );

    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("playerTracking")
        ) {
            return;
        }

        const trackedPlayers =
            await DatabaseManager.elainaDb.collections.playerTracking.get(
                "uid",
            );

        for (const trackedPlayer of trackedPlayers.values()) {
            const player = await DroidHelper.getPlayer(trackedPlayer.uid);

            if (!player) {
                continue;
            }

            const currentTime = new Date();

            const recentPlays = await ScoreHelper.getRecentScores(
                trackedPlayer.uid,
                player instanceof Player
                    ? player.recentPlays
                    : await DroidHelper.getRecentScores(trackedPlayer.uid),
            );

            for (const score of recentPlays) {
                if (currentTime.getTime() - score.date.getTime() > 600 * 1000) {
                    break;
                }

                const embed = await EmbedCreator.createRecentPlayEmbed(
                    score,
                    DroidHelper.getAvatarURL(trackedPlayer.uid),
                    8311585,
                );

                channel.send({
                    content: MessageCreator.createAccept(
                        `Recent play for ${player.username}:`,
                    ),
                    embeds: [embed],
                });
            }
        }
    }, 600 * 1000);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for tracking players that are tracked from the `addtrack` command.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
