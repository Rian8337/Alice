import { DatabaseManager } from "@alice-database/DatabaseManager";
import { TicketCreateLocalization } from "@alice-localization/interactions/modals/General/ticket-create/TicketCreateLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.supportTicket;
    const localization = new TicketCreateLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");

    const result = await dbManager.insert({
        author: interaction.user.id,
        description: description,
        id: await dbManager.getNewId(interaction.user.id),
        title: title,
    });

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createTicketFailed"),
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
