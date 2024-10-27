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

    const language = CommandHelper.getLocale(interaction);

    if (!interaction.member.roles.cache.hasAny(...Config.verifyPerm)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const localization = new TicketLocalization(language);
    const dbManager = DatabaseManager.aliceDb.collections.supportTicket;
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

    const result = await ticket.assign(interaction.user.id);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("assignTicketFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("assignTicketSuccess"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
    cooldown: 5,
};
