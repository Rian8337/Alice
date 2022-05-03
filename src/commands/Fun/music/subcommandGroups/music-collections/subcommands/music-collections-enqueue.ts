import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MusicLocalization } from "@alice-localization/commands/Fun/music/MusicLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { GuildMember, TextChannel, ThreadChannel } from "discord.js";
import yts, { VideoMetadataResult } from "yt-search";

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
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noCollectionWithName")
            ),
        });
    }

    let enqueuedCount: number = 0;

    for (const videoId of collection.videoIds) {
        const info: VideoMetadataResult = await yts({ videoId: videoId });

        const result: OperationResult = await MusicManager.enqueue(
            (<GuildMember>interaction.member).voice.channel!,
            <TextChannel | ThreadChannel>interaction.channel!,
            new MusicQueue({ type: "video", ...info }, interaction.user.id)
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
                LocaleHelper.convertToBCP47(localization.language)
            )
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
