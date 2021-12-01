import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { GuildMember, MessageEmbed } from "discord.js";
import { VideoSearchResult } from "yt-search";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    if (!musicInformation) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.botIsNotInVoiceChannel
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle("Music Information")
        .addField("Playing Since", musicInformation.createdAt.toUTCString());

    const information: VideoSearchResult | undefined =
        musicInformation.currentlyPlaying?.information;

    if (information) {
        embed
            .addField(
                "Currently Playing",
                `[${information.title}](${information.url})\n\nChannel: ${
                    information.author.name
                }\n\nDuration: ${information.duration.toString()}\n\nQueued/requested by <@${
                    musicInformation.currentlyPlaying!.queuer
                }>`
            )
            .setThumbnail(information.thumbnail);
    } else {
        embed.addField("Currently Playing", "None");
    }

    embed
        .addField(
            "Playback Settings",
            `${Symbols.repeatSingleButton} Repeat mode: ${
                musicInformation.repeat ? "Enabled" : "Disabled"
            }`
        )
        .addField(
            "Queue",
            musicInformation.queue
                .map((v, i) => `${i + 1}. ${v.information.title}`)
                .join("\n") || "None"
        );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
