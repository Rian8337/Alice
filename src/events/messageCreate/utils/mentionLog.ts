import {
    Message,
    MessageEmbed,
    MessageMentions,
    Role,
    TextChannel,
    User,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { Constants } from "@alice-core/Constants";

export const run: EventUtil["run"] = async (client, message: Message) => {
    if (
        message.author.bot ||
        (message.mentions.users.size === 0 &&
            message.mentions.roles.size === 0) ||
        message.guildId !== Constants.mainServer
    ) {
        return;
    }

    const mentions: MessageMentions = message.mentions;

    const mentionedUsers: User[] = [];
    const mentionedRoles: Role[] = [];

    for (const role of mentions.roles.values()) {
        mentionedRoles.push(role);
    }

    for (const user of mentions.users.values()) {
        mentionedUsers.push(user);
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: message.author,
        color: "#00cb16",
        footerText: `Author ID: ${message.author.id} | Channel ID: ${message.channel.id} | Message ID: ${message.id}`,
        timestamp: true,
    });

    embed.addField(
        "Channel",
        `${message.channel} | [Go to Message](${message.url})`
    );

    if (mentionedUsers.length > 0) {
        embed.addField(
            "Mentioned Users",
            mentionedUsers.map((v) => v.toString()).join(" ")
        );
    }

    if (mentionedRoles.length > 0) {
        embed.addField(
            "Mentioned Roles",
            mentionedRoles.map((v) => v.toString()).join(" ")
        );
    }

    if (message.content) {
        embed.addField("Content", message.content.substring(0, 1025));
    }

    (<TextChannel>await client.channels.fetch("683504788272578577")).send({
        embeds: [embed],
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging mentions in main server.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
