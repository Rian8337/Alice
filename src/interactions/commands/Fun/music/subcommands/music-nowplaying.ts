import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const currentlyPlaying: MusicQueue | null | undefined =
        musicInformation?.currentlyPlaying;

    if (!currentlyPlaying) {
        return InteractionHelper.reply(interaction, {
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

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
