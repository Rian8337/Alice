import { Config } from "@core/Config";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SupportTicket } from "@database/utils/aliceDb/SupportTicket";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { TicketLocalization } from "@localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const dbManager = DatabaseManager.aliceDb.collections.supportTicket;
    const language = CommandHelper.getLocale(interaction);
    const localization = new TicketLocalization(language);

    const author = interaction.options.getUser("author");
    const ticketId = interaction.options.getInteger("id");

    let ticket: SupportTicket | null;

    await InteractionHelper.deferReply(interaction);

    if (author !== null && ticketId !== null) {
        ticket = await dbManager.getFromUser(author.id, ticketId);
    } else {
        ticket = await dbManager.getFromChannel(interaction.channelId);
    }

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

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
