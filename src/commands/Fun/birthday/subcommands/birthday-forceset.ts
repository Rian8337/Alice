import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { User } from "discord.js";
import { BirthdayLocalization } from "@alice-localization/commands/Fun/birthday/BirthdayLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: BirthdayLocalization = new BirthdayLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const user: User = interaction.options.getUser("user", true);

    const date: number = interaction.options.getInteger("date", true);

    const month: number = interaction.options.getInteger("month", true) - 1;

    const timezone: number = interaction.options.getInteger("timezone", true);

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.birthday.setUserBirthday(
            user.id,
            date,
            month,
            timezone,
            localization.language,
            true
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setBirthdayFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setBirthdaySuccess"),
            date.toString(),
            (month + 1).toString(),
            timezone >= 0 ? `+${timezone}` : timezone.toString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
