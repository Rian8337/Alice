import { musicStrings } from "@alice-commands/Fun/music/musicStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MusicManager } from "@alice-utils/managers/MusicManager";
import { MusicQueue } from "@alice-utils/music/MusicQueue";
import { GuildMember, TextChannel, ThreadChannel } from "discord.js";
import yts, { VideoMetadataResult } from "yt-search";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    const collection: MusicCollection | null =
        await DatabaseManager.aliceDb.collections.musicCollection.getFromName(
            name
        );

    if (!collection) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.noCollectionWithName
            ),
        });
    }

    let enqueuedCount: number = 0;

    for await (const videoId of collection.videoIds) {
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

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.enqueueFromCollectionSuccess,
            enqueuedCount.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
