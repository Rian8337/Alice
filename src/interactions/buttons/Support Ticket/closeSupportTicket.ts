import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { CloseSupportTicketLocalization } from "@alice-localization/interactions/buttons/Support Ticket/closeSupportTicket/CloseSupportTicketLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = CommandHelper.getLocale(interaction);
    const localization = new CloseSupportTicketLocalization(language);

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

    if (
        ticket.authorId !== interaction.user.id &&
        !interaction.member.roles.cache.hasAny(...Config.verifyPerm)
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    const result = await ticket.close(language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("closeTicketFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("closeTicketSuccess"),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
