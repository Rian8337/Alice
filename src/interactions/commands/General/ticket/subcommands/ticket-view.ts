import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { TicketLocalization } from "@alice-localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const language = await CommandHelper.getLocale(interaction);
    const localization = new TicketLocalization(language);

    const id = interaction.options.getInteger("id", true);
    const ticket =
        await DatabaseManager.aliceDb.collections.supportTicket.getFromId(id);

    if (!ticket) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("ticketNotFound"),
            ),
        });
    }

    if (
        !CommandHelper.isExecutedByBotOwner(interaction) &&
        ticket.author !== interaction.user.id
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.noPermissionReject,
                ),
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        embeds: [ticket.toEmbed()],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
