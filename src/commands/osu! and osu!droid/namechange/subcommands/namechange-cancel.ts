import { DatabaseManager } from "@alice-database/DatabaseManager";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { namechangeStrings } from "../namechangeStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUser(
            interaction.user
        );

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.userHasNoActiveRequest
            ),
        });
    }

    const result: OperationResult = await nameChange.cancel();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.cancelFailed
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createReject(namechangeStrings.cancelSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
