import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { Player } from "osu-droid";
import { recentStrings } from "../recentStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const username: string = interaction.options.getString("username", true);

    const index: number = interaction.options.getInteger("index") ?? 1;

    const player: Player = await Player.getInformation({ username: username });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(recentStrings.playerNotFound)
        });
    }

    if (player.recentPlays.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(recentStrings.playerHasNoRecentPlays)
        });
    }

    if (!player.recentPlays[index - 1]) {
        return interaction.editReply({
            content: MessageCreator.createReject(recentStrings.playIndexOutOfBounds, index.toString())
        });
    }

    BeatmapManager.setChannelLatestBeatmap(interaction.channel!.id, player.recentPlays[index - 1].hash);

    const embed: MessageEmbed = await EmbedCreator.createRecentPlayEmbed(
        player.recentPlays[index - 1],
        player.avatarURL,
        (<GuildMember | null> interaction.member)?.displayColor
    );

    interaction.editReply({
        content: MessageCreator.createAccept(recentStrings.recentPlayDisplay, player.username),
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};