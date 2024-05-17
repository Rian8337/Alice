import { DatabaseManager } from "@alice-database/DatabaseManager";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { NamechangeLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/namechange/NamechangeLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: NamechangeLocalization = new NamechangeLocalization(
        CommandHelper.getLocale(interaction),
    );

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(
            interaction.options.getInteger("uid", true),
        );

    if (!nameChange || nameChange.isProcessed) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userHasNoActiveRequest"),
            ),
        });
    }

    if (nameChange.discordid !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBindedToUid"),
            ),
        });
    }

    const result: OperationResult = await nameChange.cancel();

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("cancelFailed"),
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createReject(
            localization.getTranslation("cancelSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    replyEphemeral: true,
};
