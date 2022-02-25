import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicLocalization } from "@alice-localization/commands/Fun/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const name: string = interaction.options.getString("name", true);

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            name
        );

    if (!collection) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("collectionWithNameAlreadyExists")
            ),
        });
    }

    if (collection.owner !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntOwnCollection")
            ),
        });
    }

    if (collection.videoIds.length > 10) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("collectionLimitReached")
            ),
        });
    }

    const searchResult: SearchResult = await yts(
        interaction.options.getString("query", true)
    );

    const videos: VideoSearchResult[] = searchResult.videos;

    if (videos.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("noTracksFound")
            ),
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

    const position: number = NumberHelper.clamp(
        interaction.options.getInteger("position", true),
        1,
        collection.videoIds.length
    );

    collection.videoIds.splice(position, 0, info.videoId);

    const result: OperationResult = await collection.updateCollection();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("addVideoToCollectionFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("addVideoToCollectionSuccess"),
            name,
            position.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
