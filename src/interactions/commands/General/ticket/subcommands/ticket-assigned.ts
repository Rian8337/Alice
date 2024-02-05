import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { TicketLocalization } from "@alice-localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@alice-structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@alice-structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { hyperlink } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = await CommandHelper.getLocale(interaction);

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
    const author = interaction.options.getUser("author");
    const status = <SupportTicketStatus | null>(
        interaction.options.getInteger("status")
    );

    const tickets = await DatabaseManager.aliceDb.collections.supportTicket.get(
        "id",
        {
            assigneeIds: {
                $in: [interaction.user.id],
            },
            authorId: author?.id,
            status: status ?? undefined,
        },
    );

    if (tickets.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTicketsAssigned"),
            ),
        });
    }

    const ticketArray = [...tickets.values()];
    const ticketsPerPage = 5;
    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed.setTitle(
        StringHelper.formatString(
            localization.getTranslation("assignedTicketListEmbedTitle"),
            interaction.user.username,
        ),
    );

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const tickets = ticketArray.slice(
            ticketsPerPage * page,
            ticketsPerPage * (page + 1),
        );

        for (let i = 0; i < tickets.length; ++i) {
            const ticket = tickets[i];

            embed.addFields({
                name: `${ticketsPerPage * page + i + 1}. ${ticket.title}`,
                value: `${localization.getTranslation("ticketStatus")}: ${ticket.statusToString()} | ${hyperlink(localization.getTranslation("ticketGoToChannel"), ticket.threadChannelURL)}`,
            });
        }
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(tickets.size / ticketsPerPage),
        120,
        onPageChange,
    );
};

export const config: SlashSubcommand["config"] = {
    permissions: ["Special"],
};
