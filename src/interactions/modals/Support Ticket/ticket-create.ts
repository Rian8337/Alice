import { SupportTicket } from "@alice-database/utils/aliceDb/SupportTicket";
import { TicketCreateLocalization } from "@alice-localization/interactions/modals/Support Ticket/ticket-create/TicketCreateLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ModalCommand["run"] = async (client, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new TicketCreateLocalization(language);

    await InteractionHelper.deferReply(interaction);

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");

    const result = await SupportTicket.create(
        interaction.user.id,
        title,
        description,
        false,
        undefined,
        language,
    );

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createTicketFailed"),
                title,
                description,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("createTicketSuccess"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
