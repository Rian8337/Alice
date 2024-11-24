import { DatabaseManager } from "@database/DatabaseManager";
import { MusicCollection } from "@database/utils/aliceDb/MusicCollection";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { MusicLocalization } from "@localization/interactions/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { MusicManager } from "@utils/managers/MusicManager";
import { MusicQueue } from "@utils/music/MusicQueue";
import { GuildMember } from "discord.js";
import yts, { VideoMetadataResult } from "yt-search";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inGuild()) {
        return;
    }

    const localization: MusicLocalization = new MusicLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name: string = interaction.options.getString("name", true);

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            name,
        );

    if (!collection) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCollectionWithName"),
            ),
        });
    }

    let enqueuedCount: number = 0;

    for (const videoId of collection.videoIds) {
        const info: VideoMetadataResult = await yts({ videoId: videoId });

        const result: OperationResult = await MusicManager.enqueue(
            (<GuildMember>interaction.member).voice.channel!,
            interaction.channel!,
            new MusicQueue({ type: "video", ...info }, interaction.user.id),
        );

        if (!result.success) {
            break;
        }

        ++enqueuedCount;
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("enqueueFromCollectionSuccess"),
            enqueuedCount.toLocaleString(
                LocaleHelper.convertToBCP47(localization.language),
            ),
        ),
    });
};
