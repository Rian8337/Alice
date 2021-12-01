import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { User } from "discord.js";
import { fancyStrings } from "../fancyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user", true);

    const reason: string = interaction.options.getString("reason", true);

    const result: OperationResult = await LoungeLockManager.unlock(
        user.id,
        reason
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                fancyStrings.processFailed,
                "unlock",
                <string>result.reason
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            fancyStrings.processSuccessful,
            "unlocked"
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
