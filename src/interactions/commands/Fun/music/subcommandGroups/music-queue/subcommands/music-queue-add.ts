import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { MusicManager } from "@utils/managers/MusicManager";
import { MusicQueue } from "@utils/music/MusicQueue";
import { GuildMember, StringSelectMenuInteraction } from "discord.js";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const searchResult: SearchResult = await yts(
        interaction.options.getString("query", true),
    );

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTracksFound"),
            ),
        });
    }

    const selectMenuInteraction: StringSelectMenuInteraction | null =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("chooseVideo"),
                ),
            },
            videos.map((v) => {
                return {
                    label: v.title.substring(0, 101),
                    value: v.videoId,
                    description: v.author.name.substring(0, 101),
                };
            }),
            [interaction.user.id],
            30,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const info: VideoSearchResult = videos.find(
        (v) => v.videoId === selectMenuInteraction.values[0],
    )!;

    const result: OperationResult = await MusicManager.enqueue(
        (<GuildMember>interaction.member).voice.channel!,
        interaction.channel!,
        new MusicQueue(info, interaction.user.id),
        localization.language,
        NumberHelper.clamp(
            interaction.options.getInteger("position") ?? 1,
            1,
            10,
        ),
    );

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addQueueFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addQueueSuccess"),
            info.title,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
