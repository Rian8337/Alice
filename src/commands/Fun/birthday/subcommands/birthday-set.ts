import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { birthdayStrings } from "../birthdayStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const date: number = interaction.options.getInteger("date", true);

    const month: number = interaction.options.getInteger("month", true) - 1;

    const timezone: number = interaction.options.getInteger("timezone", true);

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.birthday.setUserBirthday(
            interaction.user.id,
            date,
            month,
            timezone
        );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                birthdayStrings.setBirthdayFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            birthdayStrings.setBirthdaySuccess,
            date.toString(),
            (month + 1).toString(),
            timezone >= 0 ? `+${timezone}` : timezone.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
