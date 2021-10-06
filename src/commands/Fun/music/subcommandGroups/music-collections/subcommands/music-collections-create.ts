import { musicStrings } from "@alice-commands/Fun/music/musicStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(name);

    if (collection) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.collectionWithNameAlreadyExists)
        });
    }

    const searchResult: SearchResult = await yts(interaction.options.getString("query", true));

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(musicStrings.noTracksFound)
        });
    }

    const pickedChoice: string = (await SelectMenuCreator.createSelectMenu(
        interaction,
        "Choose the video that you want to insert to the music collection.",
        videos.map(v => {
            return {
                label: v.title.substring(0, 101),
                value: v.videoId,
                description: v.author.name.substring(0, 101)
            };
        }),
        [interaction.user.id],
        30
    ))[0];

    if (!pickedChoice) {
        return;
    }

    const info: VideoSearchResult = videos.find(v => v.videoId === pickedChoice)!;

    const result: OperationResult = await DatabaseManager.aliceDb.collections.musicCollection.insert({
        name: name,
        owner: interaction.user.id,
        videoIds: [ info.videoId ]
    });

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.createCollectionFailed, result.reason!
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.createCollectionSuccess, name
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};