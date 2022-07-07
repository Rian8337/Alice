import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Collection, MessageEmbed, TextChannel } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { TrackedPlayer } from "@alice-database/utils/elainaDb/TrackedPlayer";

export const run: EventUtil["run"] = async (client) => {
    const channel: TextChannel = <TextChannel>(
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

        const trackedPlayers: Collection<number, TrackedPlayer> =
            await DatabaseManager.elainaDb.collections.playerTracking.get(
                "uid"
            );

        for (const trackedPlayer of trackedPlayers.values()) {
            const player: Player | null = await Player.getInformation(
                trackedPlayer.uid
            );

            if (!player) {
                continue;
            }

            const currentTime: Date = new Date();

            for (const score of player.recentPlays) {
                if (currentTime.getTime() - score.date.getTime() > 600 * 1000) {
                    break;
                }

                const embed: MessageEmbed =
                    await EmbedCreator.createRecentPlayEmbed(
                        score,
                        player.avatarURL,
                        8311585
                    );

                channel.send({
                    content: MessageCreator.createAccept(
                        `Recent play for ${player.username}:`
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
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
