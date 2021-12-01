import { musicStrings } from "@alice-commands/Fun/music/musicStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";

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

    if (collection.owner !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.userDoesntOwnCollection
            ),
        });
    }

    const position: number = NumberHelper.clamp(
        interaction.options.getInteger("position", true),
        1,
        collection.videoIds.length
    );

    collection.videoIds.splice(position - 1, 1);

    const result: OperationResult = await collection.updateCollection();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.removeVideoFromCollectionFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.removeVideoFromCollectionSuccess,
            position.toLocaleString(),
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
