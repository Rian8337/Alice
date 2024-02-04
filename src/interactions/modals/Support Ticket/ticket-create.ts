import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SupportTicket } from "@alice-database/utils/aliceDb/SupportTicket";
import { SupportTicketStatus } from "@alice-enums/ticket/SupportTicketStatus";
import { TicketCreateLocalization } from "@alice-localization/interactions/modals/Support Ticket/ticket-create/TicketCreateLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { DatabaseSupportTicket } from "@alice-structures/database/aliceDb/DatabaseSupportTicket";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ChannelType, TextChannel } from "discord.js";

export const run: ModalCommand["run"] = async (client, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.supportTicket;
    const language = await CommandHelper.getLocale(interaction);
    const localization = new TicketCreateLocalization(language);

    await InteractionHelper.deferReply(interaction);

    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");

    const guild = await client.guilds.fetch(Constants.mainServer);
    const userChannel = await guild.channels.fetch(
        Constants.supportTicketUserChannel,
    );
    const staffChannel = await guild.channels.fetch(
        Constants.supportTicketStaffChannel,
    );

    if (
        !(userChannel instanceof TextChannel) ||
        !(staffChannel instanceof TextChannel)
    ) {
        return;
    }

    const ticketId = await dbManager.getNewId(interaction.user.id);
    const threadChannel = await userChannel.threads.create({
        name: `Ticket #${ticketId} ${interaction.user.id}`,
        invitable: false,
        type: ChannelType.PrivateThread,
        reason: "New ticket opened",
    });

    const controlPanelMessage = await threadChannel.send({
        content: localization.getTranslation("pleaseWait"),
    });

    const trackingMessage = await staffChannel.send({
        content: localization.getTranslation("pleaseWait"),
    });

    const databaseTicket: DatabaseSupportTicket = {
        authorId: interaction.user.id,
        assigneeIds: [],
        controlPanelMessageId: controlPanelMessage.id,
        createdAt: Date.now(),
        description: description,
        id: ticketId,
        guildChannelId: Constants.supportTicketUserChannel,
        status: SupportTicketStatus.open,
        title: title,
        threadChannelId: threadChannel.id,
        trackingMessageId: trackingMessage.id,
    };

    const result = await dbManager.insert(databaseTicket);

    if (result.failed()) {
        await threadChannel.delete("Ticket creation failed");
        await trackingMessage.delete();

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("createTicketFailed"),
            ),
        });
    }

    const ticket = new SupportTicket(databaseTicket);

    await controlPanelMessage.edit({
        content: MessageCreator.createWarn(
            "You may control your ticket from this message or slash commands.",
        ),
        embeds: [ticket.toUserEmbed(language)],
        components: ticket.createUserControlPanelButtons(language),
    });
    await controlPanelMessage.pin();

    await trackingMessage.edit({
        content: "",
        embeds: [ticket.toStaffEmbed()],
        components: ticket.createTrackingMessageButtons(),
    });

    await threadChannel.members.add(interaction.user.id);

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("createTicketSuccess"),
        ),
    });
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
