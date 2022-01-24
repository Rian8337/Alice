import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ScoreRank } from "@alice-types/utils/ScoreRank";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import {
    CommandInteraction,
    GuildMember,
    Message,
    MessageEmbed,
    Snowflake,
} from "discord.js";
import { Player, Score } from "@rian8337/osu-droid-utilities";
import { NumberHelper } from "./NumberHelper";

/**
 * A helper for displaying scores to a user.
 */
export abstract class ScoreDisplayHelper {
    /**
     * Shows a player's recent plays.
     *
     * @param interaction The interaction that triggered the command.
     * @param player The player.
     * @returns A message showing the player's recent plays.
     */
    static async showRecentPlays(
        interaction: CommandInteraction,
        player: Player
    ): Promise<Message> {
        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            author: interaction.user,
            color: (<GuildMember | null>interaction.member)?.displayColor,
        });

        const page: number = NumberHelper.clamp(
            interaction.options.getInteger("page") ?? 1,
            1,
            Math.ceil(player.recentPlays.length / 5)
        );

        embed.setDescription(`Recent plays for **${player.username}**`);

        const onPageChange: OnButtonPageChange = async (
            _,
            page,
            contents: Score[]
        ) => {
            for (
                let i = 5 * (page - 1);
                i < Math.min(contents.length, 5 + 5 * (page - 1));
                ++i
            ) {
                const score: Score = contents[i];

                embed.addField(
                    `${i + 1}. **${BeatmapManager.getRankEmote(
                        <ScoreRank>score.rank
                    )}** | ${score.title} ${score.getCompleteModString()}`,
                    `${score.score.toLocaleString()} / ${score.combo}x / ${(
                        score.accuracy.value() * 100
                    ).toFixed(2)}% / [${score.accuracy.n300}/${score.accuracy.n100
                    }/${score.accuracy.n50}/${score.accuracy.nmiss}]\n` +
                    `\`${score.date.toUTCString()}\``
                );
            }
        };

        return MessageButtonCreator.createLimitedButtonBasedPaging(
            interaction,
            { embeds: [embed] },
            [interaction.user.id],
            player.recentPlays,
            5,
            page,
            120,
            onPageChange
        );
    }

    /**
     * Gets the emote ID of a rank.
     *
     * @param rank The rank.
     * @returns The emote ID.
     */
    static getRankEmoteID(rank: ScoreRank): Snowflake {
        switch (rank) {
            case "A":
                return "611559473236148265";
            case "B":
                return "611559473169039413";
            case "C":
                return "611559473328422942";
            case "D":
                return "611559473122639884";
            case "S":
                return "611559473294606336";
            case "X":
                return "611559473492000769";
            case "SH":
                return "611559473361846274";
            case "XH":
                return "611559473479155713";
        }
    }
}
