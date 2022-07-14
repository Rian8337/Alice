import { GuildChannel, Message, MessageEmbed, ThreadChannel } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: EventUtil["run"] = async (
    _,
    oldMessage: Message,
    newMessage: Message
) => {
    try {
        await newMessage.fetch();

        if (!newMessage.author || newMessage.author.bot) {
            return;
        }

        await oldMessage.fetch();
    } catch {
        return;
    }

    const logChannel: GuildChannel | ThreadChannel | undefined =
        newMessage.guild?.channels.cache.find(
            (c) => c.id === "643770576238018570"
        );

    if (!logChannel?.isText()) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: oldMessage.author,
        color: "#00cb16",
        footerText: `Author ID: ${oldMessage.author.id} | Channel ID: ${oldMessage.channel.id} | Message ID: ${oldMessage.id}`,
        timestamp: true,
    });

    embed
        .setTitle("Message edited")
        .addField(
            "Channel",
            `${oldMessage.channel} | [Go to Message](${oldMessage.url})`
        );

    if (oldMessage.content) {
        embed.addField("Old Message", oldMessage.content.substring(0, 1025));
    }

    if (newMessage.content) {
        embed.addField("New Message", newMessage.content.substring(0, 1025));
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging edited messages",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
