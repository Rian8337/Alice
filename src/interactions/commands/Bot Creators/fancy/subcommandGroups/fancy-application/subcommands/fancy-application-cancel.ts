import { DatabaseManager } from "@alice-database/DatabaseManager";
import { FancyLocalization } from "@alice-localization/interactions/commands/Bot Creators/fancy/FancyLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new FancyLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const application =
        await DatabaseManager.aliceDb.collections.fancyApplication.getUserActiveApplication(
            interaction.user.id,
        );

    if (!application) {
        return interaction.editReply({
            content: localization.getTranslation("activeApplicationNotFound"),
        });
    }

    const result = await application.cancel(localization.language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("applicationCancelFailed"),
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("applicationCancelSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
