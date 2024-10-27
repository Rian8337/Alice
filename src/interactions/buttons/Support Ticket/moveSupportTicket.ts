import { Config } from "@core/Config";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MoveSupportTicketLocalization } from "@localization/interactions/buttons/Support Ticket/moveSupportTicket/MoveSupportTicketLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import {
    ChannelType,
    ForumChannel,
    TextChannel,
    channelMention,
} from "discord.js";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const language = CommandHelper.getLocale(interaction);
    const localization = new MoveSupportTicketLocalization(language);

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

    const selectMenuInteraction =
        await SelectMenuCreator.createChannelSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("selectChannelPrompt"),
                ),
            },
            [ChannelType.GuildText, ChannelType.GuildForum],
            [interaction.user.id],
            30,
        );

    if (!selectMenuInteraction) {
        return;
    }

    await selectMenuInteraction.deferUpdate();

    const channel = selectMenuInteraction.channels.first();
    if (
        !channel ||
        (!(channel instanceof TextChannel) &&
            !(channel instanceof ForumChannel))
    ) {
        return;
    }

    const result = await ticket.move(channel, language);

    if (result.failed()) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("moveTicketFailed"),
                result.reason,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("moveTicketSuccess"),
            channelMention(ticket.threadChannelId),
        ),
    });
};

export const config: ButtonCommand["config"] = {
    cooldown: 30,
    replyEphemeral: true,
};
