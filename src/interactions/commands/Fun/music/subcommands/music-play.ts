import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import yts, { SearchResult, VideoSearchResult } from "yt-search";
import {
    GuildMember,
    SelectMenuInteraction,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { MusicLocalization } from "@alice-localization/interactions/commands/Fun/music/MusicLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

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
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("playTrackFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("playTrackSuccess"),
            info.title
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
