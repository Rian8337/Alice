import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicInfo } from "@utils/music/MusicInfo";
import { MusicQueue } from "@utils/music/MusicQueue";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MusicManager } from "@utils/managers/MusicManager";
import { GuildMember, EmbedBuilder } from "discord.js";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    const currentlyPlaying: MusicQueue | null | undefined =
        musicInformation?.currentlyPlaying;

    if (!currentlyPlaying) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new MusicLocalization(
                    CommandHelper.getLocale(interaction),
                ).getTranslation("noMusicIsPlaying"),
            ),
        });
    }

    const embed: EmbedBuilder =
        EmbedCreator.createMusicQueueEmbed(currentlyPlaying);

    embed
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL()!,
        })
        .setColor((<GuildMember>interaction.member).displayColor);

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
