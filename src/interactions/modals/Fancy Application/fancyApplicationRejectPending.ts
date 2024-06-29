import { DatabaseManager } from "@alice-database/DatabaseManager";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";
import { FancyApplicationRejectPendingLocalization } from "@alice-localization/interactions/modals/Fancy Application/fancy-application-reject-pending/FancyApplicationRejectPendingLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ModalCommand["run"] = async (client, interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) {
        return;
    }

    const localization = new FancyApplicationRejectPendingLocalization(
        CommandHelper.getLocale(interaction),
    );
    const dbManager = DatabaseManager.aliceDb.collections.fancyApplication;

    await InteractionHelper.deferReply(interaction);

    const application = await dbManager.getByUserId(interaction.user.id);

    if (!application) {
        return InteractionHelper.reply(interaction, {
            content: localization.getTranslation("applicationNotFound"),
        });
    }

    if (application.status !== FancyApplicationStatus.pendingApproval) {
        return InteractionHelper.reply(interaction, {
            content: localization.getTranslation("applicationNotPending"),
        });
    }

    const result = await application.rejectPendingApproval(
        interaction.fields.getTextInputValue("reason"),
        localization.language,
    );

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("applicationRejectFailed"),
            ),
        });
    }

    await InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("applicationRejectSuccess"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
