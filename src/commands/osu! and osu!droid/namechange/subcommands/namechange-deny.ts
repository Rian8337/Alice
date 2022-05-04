import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Constants } from "@alice-core/Constants";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { NamechangeLocalization } from "@alice-localization/commands/osu! and osu!droid/namechange/NamechangeLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: NamechangeLocalization = new NamechangeLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit
        )
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("invalidUid")
            ),
        });
    }

    const reason: string = interaction.options.getString("reason", true);

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange || nameChange.isProcessed) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("uidHasNoActiveRequest")
            ),
        });
    }

    const result: OperationResult = await nameChange.deny(
        reason,
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("denyFailed"),
                result.reason!
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("denySuccess"),
            reason
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: ["BOT_OWNER"],
};
