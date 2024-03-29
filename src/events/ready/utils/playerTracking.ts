import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Collection, EmbedBuilder, TextChannel } from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { TrackedPlayer } from "@alice-database/utils/elainaDb/TrackedPlayer";
import { RecentPlay } from "@alice-database/utils/aliceDb/RecentPlay";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";

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
            const recentPlays: (Score | RecentPlay)[] =
                await ScoreHelper.getRecentScores(
                    player.uid,
                    player.recentPlays
                );

            for (const score of recentPlays) {
                if (currentTime.getTime() - score.date.getTime() > 600 * 1000) {
                    break;
                }

                const embed: EmbedBuilder =
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
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
