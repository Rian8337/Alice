import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TicketEditLocalization } from "@alice-localization/interactions/modals/General/ticket-edit/TicketEditLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.supportTicket;
    const localization = new TicketEditLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const id = parseInt(interaction.customId.split("#")[1]);
    const ticket = await dbManager.getFromId(id, {
        projection: { _id: 0, id: 1 },
    });

    if (!ticket) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketNotFound"),
            ),
        });
    }

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");

    const result = await dbManager.updateOne(
        { id: id },
        {
            $set: {
                title: title,
                description: description,
            },
        },
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("editTicketFailed"),
                title,
                description,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("editTicketSuccess"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
