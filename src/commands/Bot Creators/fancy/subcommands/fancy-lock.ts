import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";
import { User } from "discord.js";
import { fancyStrings } from "../fancyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user", true);

    const duration: number = CommandHelper.convertStringTimeFormat(
        interaction.options.getString("duration", true)
    );

    const reason: string = interaction.options.getString("reason", true);

    if (!Number.isFinite(duration)) {
        return interaction.editReply({
            content: MessageCreator.createReject(fancyStrings.durationError),
        });
    }

    const result: OperationResult = await LoungeLockManager.lock(
        user.id,
        reason,
        duration
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                fancyStrings.processFailed,
                "lock",
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            fancyStrings.processSuccessful,
            "locked"
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
