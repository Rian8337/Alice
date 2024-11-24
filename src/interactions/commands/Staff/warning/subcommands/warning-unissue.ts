import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { WarningLocalization } from "@localization/interactions/commands/Staff/warning/WarningLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { WarningManager } from "@utils/managers/WarningManager";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new WarningLocalization(
        CommandHelper.getLocale(interaction),
    );

    const warning =
        await DatabaseManager.aliceDb.collections.userWarning.getByGuildWarningId(
            interaction.guildId!,
            interaction.options.getInteger("id", true),
        );

    if (!warning) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warningNotFound"),
            ),
        });
    }

    const reason = interaction.options.getString("reason", true);

    await InteractionHelper.deferReply(interaction);

    const result = await WarningManager.unissue(interaction, warning, reason);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("warnUnissueFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("warnUnissueSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
