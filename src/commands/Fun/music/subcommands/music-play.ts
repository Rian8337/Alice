import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import yts, { SearchResult, VideoSearchResult } from "yt-search";
import { GuildMember } from "discord.js";
import { musicStrings } from "../musicStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    if (MusicManager.musicInformations.get((<GuildMember> interaction.member).voice.channelId!)?.player) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.musicIsStillPlaying)
        });
    }

    const searchResult: SearchResult = await yts(interaction.options.getString("query", true));

    const videos: VideoSearchResult[] = searchResult.videos.slice(0, 26);

    if (videos.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.noTracksFound)
        });
    }

    const pickedChoice: string | undefined = (await SelectMenuCreator.createSelectMenu(
        interaction,
        "Choose the video that you want to play.",
        videos.map(v => {
            return {
                label: v.title.substring(0, 101),
                value: v.videoId,
                description: v.author.name.substring(0, 101)
            };
        }),
        [interaction.user.id],
        60
    ))[0];

    if (!pickedChoice) {
        return;
    }

    const info: VideoSearchResult = videos.find(v => v.videoId === pickedChoice)!;

    const result: OperationResult = await MusicManager.play(
        (<GuildMember> interaction.member).voice.channel!,
        interaction.channel!,
        {
            information: info,
            queuer: interaction.user.id
        }
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.playTrackFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.playTrackSuccess, info.title
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};