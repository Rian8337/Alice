import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import yts, { SearchResult, VideoSearchResult } from "yt-search";
import { GuildMember, TextChannel, ThreadChannel } from "discord.js";
import { musicStrings } from "../musicStrings";
import { MusicQueue } from "@alice-utils/music/MusicQueue";

export const run: Subcommand["run"] = async (_, interaction) => {
    const searchResult: SearchResult = await yts(
        interaction.options.getString("query", true)
    );

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.noTracksFound),
        });
    }

    const pickedChoice: string = (
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    "Choose the video that you want to play."
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
        new MusicQueue(info, interaction.user.id)
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.playTrackFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.playTrackSuccess,
            info.title
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
