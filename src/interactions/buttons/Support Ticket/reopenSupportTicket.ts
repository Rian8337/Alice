import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { ReopenSupportTicketLocalization } from "@alice-localization/interactions/buttons/Support Ticket/reopenSupportTicket/ReopenSupportTicketLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new ReopenSupportTicketLocalization(language);

    await InteractionHelper.deferReply(interaction);

    const threadChannelId = interaction.customId.split("#")[1];
    const ticket =
        await DatabaseManager.aliceDb.collections.supportTicket.getFromChannel(
            threadChannelId,
        );

    if (!ticket) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketNotFound"),
            ),
        });
    }

    if (!ticket.isClosed) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketIsNotClosed"),
            ),
        });
    }

    if (!ticket.canModify(interaction.user.id)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    const result = await ticket.reopen(language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("reopenTicketFailed"),
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("reopenTicketSuccess"),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
