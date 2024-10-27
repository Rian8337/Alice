import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { OperationResult } from "structures/core/OperationResult";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { BirthdayLocalization } from "@localization/interactions/commands/Fun/birthday/BirthdayLocalization";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: BirthdayLocalization = new BirthdayLocalization(
        CommandHelper.getLocale(interaction),
    );

    const date: number = interaction.options.getInteger("date", true);

    const month: number = interaction.options.getInteger("month", true) - 1;

    const timezone: number = interaction.options.getInteger("timezone", true);

    const result: OperationResult =
        await DatabaseManager.aliceDb.collections.birthday.setUserBirthday(
            interaction.user.id,
            date,
            month,
            timezone,
            localization.language,
        );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("setBirthdayFailed"),
                result.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("setBirthdaySuccess"),
            date.toString(),
            (month + 1).toString(),
            timezone >= 0 ? `+${timezone}` : timezone.toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
