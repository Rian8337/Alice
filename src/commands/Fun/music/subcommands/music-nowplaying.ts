import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const currentlyPlaying: MusicQueue | null | undefined =
        musicInformation?.currentlyPlaying;

    if (!currentlyPlaying) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new MusicLocalization(
                    await CommandHelper.getLocale(interaction)
                ).getTranslation("noMusicIsPlaying")
            ),
        });
    }

    const embed: MessageEmbed =
        EmbedCreator.createMusicQueueEmbed(currentlyPlaying);

    embed
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL({ dynamic: true })!,
        })
        .setColor((<GuildMember>interaction.member).displayColor);

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
