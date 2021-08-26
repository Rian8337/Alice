import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerTracking } from "@alice-database/utils/elainaDb/PlayerTracking";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { DatabasePlayerTracking } from "@alice-interfaces/database/elainaDb/DatabasePlayerTracking";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, MessageEmbed, TextChannel } from "discord.js";
import { Player } from "osu-droid";

export const run: EventUtil["run"] = async (client) => {
    const channel: TextChannel = <TextChannel> await client.channels.fetch("665106609382359041");

    setInterval(async () => {
        if (Config.maintenance) {
            return;
        }

        const trackedPlayers: Collection<number, PlayerTracking> = await DatabaseManager.elainaDb.collections.playerTracking.get("uid");

        const execDate: Date = new Date();

        for await (const trackedPlayer of trackedPlayers.values()) {
            const player: Player = await Player.getInformation({ uid: trackedPlayer.uid });

            if (!player.username) {
                continue;
            }

            for await (const score of player.recentPlays) {
                if (execDate.getTime() - score.date.getTime() > 600 * 1000) {
                    break;
                }

                const embed: MessageEmbed = await EmbedCreator.createRecentPlayEmbed(
                    score, player.avatarURL, 8311585
                );

                channel.send({
                    content: MessageCreator.createAccept(
                        `Recent play for ${player.username}:`
                    ),
                    embeds: [embed]
                });
            }
        }
    }, 600 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking players that are tracked from the `addtrack` command.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};