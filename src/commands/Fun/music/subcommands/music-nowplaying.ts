import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const currentlyPlaying: MusicQueue | null | undefined =
        musicInformation?.currentlyPlaying;

    if (!currentlyPlaying) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.noMusicIsPlaying),
        });
    }

    const embed: MessageEmbed =
        EmbedCreator.createMusicQueueEmbed(currentlyPlaying);

    embed
        .setAuthor(
            interaction.user.tag,
            interaction.user.avatarURL({ dynamic: true })!
        )
        .setColor((<GuildMember>interaction.member).displayColor);

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
