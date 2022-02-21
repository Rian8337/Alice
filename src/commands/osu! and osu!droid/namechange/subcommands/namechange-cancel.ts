import { DatabaseManager } from "@alice-database/DatabaseManager";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { NamechangeLocalization } from "@alice-localization/commands/osu! and osu!droid/NamechangeLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: NamechangeLocalization = new NamechangeLocalization(await CommandHelper.getLocale(interaction));

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUser(
            interaction.user
        );

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userHasNoActiveRequest")
            ),
        });
    }

    const result: OperationResult = await nameChange.cancel();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("cancelFailed")
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createReject(localization.getTranslation("cancelSuccess")),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
