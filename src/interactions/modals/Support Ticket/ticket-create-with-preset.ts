import { SupportTicket } from "@alice-database/utils/aliceDb/SupportTicket";
import { SupportTicketPreset } from "@alice-database/utils/aliceDb/SupportTicketPreset";
import { TicketCreateWithPresetLocalization } from "@alice-localization/interactions/modals/Support Ticket/ticket-create-with-preset/TicketCreateWithPresetLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ModalTicketPresetProcessor } from "@alice-utils/ticket/presets/ModalTicketPresetProcessor";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const language = CommandHelper.getLocale(interaction);
    const localization = new TicketCreateWithPresetLocalization(language);

    await InteractionHelper.deferReply(interaction);

    const id = parseInt(interaction.customId.split("#")[1]);

    const presetProcessor = <ModalTicketPresetProcessor>(
        SupportTicketPreset.createProcessor(id)
    );
    const processedPreset =
        await presetProcessor.processModalSubmission(interaction);

    if (!processedPreset) {
        return;
    }

    const result = await SupportTicket.create(
        interaction.user.id,
        processedPreset.title,
        processedPreset.description,
        processedPreset.assignees,
        id,
        language,
    );

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createTicketFailed"),
                processedPreset.title,
                processedPreset.description,
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
