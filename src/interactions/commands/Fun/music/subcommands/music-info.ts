import { Symbols } from "@alice-enums/utils/Symbols";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicInfo } from "@alice-utils/music/MusicInfo";
import { GuildMember, EmbedBuilder, userMention } from "discord.js";
import { VideoSearchResult } from "yt-search";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const musicInformation: MusicInfo | undefined =
        MusicManager.musicInformations.get(interaction.guildId!);

    if (!musicInformation) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("botIsNotInVoiceChannel"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed.setTitle(localization.getTranslation("musicInfo")).addFields({
        name: localization.getTranslation("playingSince"),
        value: DateTimeFormatHelper.dateToLocaleString(
            musicInformation.createdAt,
            localization.language,
        ),
    });

    const information: VideoSearchResult | undefined =
        musicInformation.currentlyPlaying?.information;

    if (information) {
        embed
            .addFields({
                name: localization.getTranslation("currentlyPlaying"),
                value: `[${information.title}](${
                    information.url
                })\n\n${localization.getTranslation("channel")}: ${
                    information.author.name
                }\n\n${localization.getTranslation(
                    "duration",
                )}: ${information.duration.toString()}\n\n${StringHelper.formatString(
                    localization.getTranslation("requestedBy"),
                    userMention(musicInformation.currentlyPlaying!.queuer),
                )}`,
            })
            .setThumbnail(information.thumbnail ?? null);
    } else {
        embed.addFields({
            name: localization.getTranslation("currentlyPlaying"),
            value: localization.getTranslation("none"),
        });
    }

    embed.addFields(
        {
            name: localization.getTranslation("playbackSettings"),
            value: `${Symbols.repeatSingleButton} ${localization.getTranslation(
                "repeatMode",
            )}: ${localization.getTranslation(
                musicInformation.repeat ? "enabled" : "disabled",
            )}`,
        },
        {
            name: localization.getTranslation("queue"),
            value:
                musicInformation.queue
                    .map((v, i) => `${i + 1}. ${v.information.title}`)
                    .join("\n") || localization.getTranslation("none"),
        },
    );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
