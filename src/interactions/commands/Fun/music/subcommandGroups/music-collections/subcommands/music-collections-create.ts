import { DatabaseManager } from "@database/DatabaseManager";
import { MusicCollection } from "@database/utils/aliceDb/MusicCollection";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringSelectMenuInteraction } from "discord.js";
import yts, { SearchResult, VideoSearchResult } from "yt-search";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            name,
        );

    if (collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("collectionWithNameAlreadyExists"),
            ),
        });
    }

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

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.musicCollection.insert({
            name: name,
            owner: interaction.user.id,
            videoIds: [info.videoId],
        });

    if (!result.success) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createCollectionFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("createCollectionSuccess"),
            name,
        ),
    });
};
