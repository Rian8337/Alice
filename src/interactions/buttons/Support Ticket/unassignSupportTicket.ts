import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UnassignSupportTicketLocalization } from "@alice-localization/interactions/buttons/Support Ticket/unassignSupportTicket/UnassignSupportTicketLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new UnassignSupportTicketLocalization(language);

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

    const result = await ticket.unassign(interaction.user.id);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("unassignTicketFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unassignTicketSuccess"),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
