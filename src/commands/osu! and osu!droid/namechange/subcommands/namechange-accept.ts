import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { NamechangeLocalization } from "@alice-localization/commands/osu! and osu!droid/NamechangeLocalization";
import { Language } from "@alice-localization/base/Language";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: NamechangeLocalization = new NamechangeLocalization(language);

    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(localization.getTranslation("invalidUid")),
        });
    }

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange || nameChange.isProcessed) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("uidHasNoActiveRequest")
            ),
        });
    }

    const result: OperationResult = await nameChange.accept(language);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("acceptFailed"),
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(localization.getTranslation("acceptSuccess")),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
