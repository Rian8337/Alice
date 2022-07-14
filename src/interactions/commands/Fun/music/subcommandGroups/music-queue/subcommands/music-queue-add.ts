import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import {
    GuildMember,
    SelectMenuInteraction,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const searchResult: SearchResult = await yts(
        interaction.options.getString("query", true)
    );

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTracksFound")
            ),
        });
    }

    const selectMenuInteraction: SelectMenuInteraction | null =
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("chooseVideo")
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
            30
        );

    if (!selectMenuInteraction) {
        return;
    }

    const info: VideoSearchResult = videos.find(
        (v) => v.videoId === selectMenuInteraction.values[0]
    )!;

    const result: OperationResult = await MusicManager.enqueue(
        (<GuildMember>interaction.member).voice.channel!,
        <TextChannel | ThreadChannel>interaction.channel!,
        new MusicQueue(info, interaction.user.id),
        localization.language,
        NumberHelper.clamp(
            interaction.options.getInteger("position") ?? 1,
            1,
            10
        )
    );

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("addQueueFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("addQueueSuccess"),
            info.title
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
