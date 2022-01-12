import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { namechangeStrings } from "../namechangeStrings";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: Subcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(namechangeStrings.invalidUid),
        });
    }

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.uidHasNoActiveRequest
            ),
        });
    }

    const result: OperationResult = await nameChange.accept();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.acceptFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(namechangeStrings.acceptSuccess),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
