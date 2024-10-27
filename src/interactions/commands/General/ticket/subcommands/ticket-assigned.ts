import { Config } from "@core/Config";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SupportTicketStatus } from "@enums/ticket/SupportTicketStatus";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { TicketLocalization } from "@localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { hyperlink } from "discord.js";

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
        { sort: { createdAt: -1 } },
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
            ticketsPerPage * (page - 1),
            ticketsPerPage * page,
        );

        for (let i = 0; i < tickets.length; ++i) {
            const ticket = tickets[i];

            embed.addFields({
                name: `${ticketsPerPage * (page - 1) + i + 1}. ${ticket.title}`,
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
