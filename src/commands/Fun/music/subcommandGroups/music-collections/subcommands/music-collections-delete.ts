import { musicStrings } from "@alice-commands/Fun/music/musicStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MusicCollection } from "@alice-database/utils/aliceDb/MusicCollection";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";

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

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.musicCollection.delete({
            name: name,
        });

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                musicStrings.deleteCollectionFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            musicStrings.deleteCollectionSuccess,
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
