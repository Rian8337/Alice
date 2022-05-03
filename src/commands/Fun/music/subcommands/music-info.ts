import { Symbols } from "@alice-enums/utils/Symbols";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { GuildMember, MessageEmbed } from "discord.js";
import { VideoSearchResult } from "yt-search";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    if (!musicInformation) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("botIsNotInVoiceChannel")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setTitle(localization.getTranslation("musicInfo"))
        .addField(
            localization.getTranslation("playingSince"),
            DateTimeFormatHelper.dateToLocaleString(
                musicInformation.createdAt,
                localization.language
            )
        );

    const information: VideoSearchResult | undefined =
        musicInformation.currentlyPlaying?.information;

    if (information) {
        embed
            .addField(
                localization.getTranslation("currentlyPlaying"),
                `[${information.title}](${
                    information.url
                })\n\n${localization.getTranslation("channel")}: ${
                    information.author.name
                }\n\n${localization.getTranslation(
                    "duration"
                )}: ${information.duration.toString()}\n\n${StringHelper.formatString(
                    localization.getTranslation("requestedBy"),
                    `<@${musicInformation.currentlyPlaying!.queuer}>`
                )}`
            )
            .setThumbnail(information.thumbnail);
    } else {
        embed.addField(
            localization.getTranslation("currentlyPlaying"),
            localization.getTranslation("none")
        );
    }

    embed
        .addField(
            localization.getTranslation("playbackSettings"),
            `${Symbols.repeatSingleButton} ${localization.getTranslation(
                "repeatMode"
            )}: ${localization.getTranslation(
                musicInformation.repeat ? "enabled" : "disabled"
            )}`
        )
        .addField(
            localization.getTranslation("queue"),
            musicInformation.queue
                .map((v, i) => `${i + 1}. ${v.information.title}`)
                .join("\n") || localization.getTranslation("none")
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
