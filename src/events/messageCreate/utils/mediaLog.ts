import { Message, MessageEmbed, TextChannel } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: EventUtil["run"] = async (client, message: Message) => {
    if (
        message.attachments.size === 0 ||
        message.guild?.id !== Constants.mainServer ||
        message.author.bot
    ) {
        return;
    }

    const logChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("684630015538626570")
    );

    for (const attachment of message.attachments.values()) {
        if (
            !StringHelper.isValidImage(attachment.url) &&
            !StringHelper.isValidVideo(attachment.url)
        ) {
            continue;
        }

        const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
            author: message.author,
            color: "#cb8900",
            footerText: `Author ID: ${message.author.id} | Channel ID: ${message.channel.id} | Message ID: ${message.id}`,
            timestamp: true,
        });

        embed.addField(
            "Channel",
            `${message.channel} | [Go to Message](${message.url})`
        );

        if (message.content) {
            embed.addField("Content", message.content.substring(0, 1025));
        }

        logChannel.send({
            content: attachment.url,
            embeds: [embed],
        });
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for logging pictures and videos under 8 MB that are sent by users in main server.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
