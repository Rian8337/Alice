import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { MusicLocalization } from "@alice-localization/commands/Fun/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { GuildMember, TextChannel, ThreadChannel } from "discord.js";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: MusicLocalization = new MusicLocalization(language);

    const searchResult: SearchResult = await yts(
        interaction.options.getString("query", true)
    );

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("noTracksFound")),
        });
    }

    const pickedChoice: string = (
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
        )
    )[0];

    if (!pickedChoice) {
        return;
    }

    const info: VideoSearchResult = videos.find(
        (v) => v.videoId === pickedChoice
    )!;

    const result: OperationResult = await MusicManager.enqueue(
        (<GuildMember>interaction.member).voice.channel!,
        <TextChannel | ThreadChannel>interaction.channel!,
        new MusicQueue(info, interaction.user.id),
        language,
        NumberHelper.clamp(
            interaction.options.getInteger("position") ?? 1,
            1,
            10
        )
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("addQueueFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("addQueueSuccess"),
            info.title
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
