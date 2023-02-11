import { Message, EmbedBuilder, TextChannel, hyperlink } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
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

        const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
            author: message.author,
            color: "#cb8900",
            footerText: `Author ID: ${message.author.id} | Channel ID: ${message.channel.id} | Message ID: ${message.id}`,
            timestamp: true,
        });

        embed.addFields({
            name: "Channel",
            value: `${message.channel} | ${hyperlink(
                "Go to Message",
                message.url
            )}`,
        });

        if (message.content) {
            embed.addFields({
                name: "Content",
                value: message.content.substring(0, 1025),
            });
        }

        try {
            logChannel.send({
                files: [attachment],
                embeds: [embed],
            });
            // eslint-disable-next-line no-empty
        } catch {}
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for logging pictures and videos under 8 MB that are sent by users in main server.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
