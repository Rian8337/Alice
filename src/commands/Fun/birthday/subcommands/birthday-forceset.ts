import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { birthdayStrings } from "../birthdayStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const user: User = interaction.options.getUser("user", true);

    const date: number = interaction.options.getInteger("date", true);

    const month: number = interaction.options.getInteger("month", true) - 1;

    const timezone: number = interaction.options.getInteger("timezone", true);

    const result: DatabaseOperationResult = await DatabaseManager.aliceDb.collections.birthday.setUserBirthday(user.id, date, month, timezone, true);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                birthdayStrings.setBirthdayFailed, <string> result.reason
            )
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            birthdayStrings.setBirthdaySuccess,
            date.toString(),
            (month + 1).toString(),
            timezone >= 0 ? `+${timezone}` : timezone.toString()
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"]
};