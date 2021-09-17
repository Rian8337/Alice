import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicInfo } from "@alice-interfaces/music/MusicInfo";
import { MusicQueue } from "@alice-interfaces/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined = MusicManager.musicInformations.get((<GuildMember> interaction.member).voice.channelId!);

    const currentlyPlaying: MusicQueue | null | undefined = musicInformation?.currentlyPlaying;

    if (!currentlyPlaying) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.noMusicIsPlaying)
        });
    }

    const embed: MessageEmbed = EmbedCreator.createMusicQueueEmbed(currentlyPlaying);

    embed.setAuthor(interaction.user.tag, interaction.user.avatarURL({ dynamic: true })!)
        .setColor((<GuildMember> interaction.member).displayColor)
        .setTitle(currentlyPlaying.information.title)
        .setThumbnail(currentlyPlaying.information.thumbnail)
        .setDescription(`${currentlyPlaying.information.author.name}\n\nDuration: ${currentlyPlaying.information.duration.toString()}\n\nQueued/requested by <@${currentlyPlaying.queuer}>`)
        .setURL(currentlyPlaying.information.url);

    interaction.editReply({
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};