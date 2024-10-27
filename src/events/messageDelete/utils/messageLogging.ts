import { GuildChannel, Message, EmbedBuilder, ThreadChannel } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@utils/creators/EmbedCreator";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author?.bot) {
        return;
    }

    const logChannel: GuildChannel | ThreadChannel | undefined =
        message.guild?.channels.cache.find(
            (c) => c.id === "643770576238018570",
        );

    if (!logChannel?.isTextBased()) {
        return;
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: message.author,
        color: "#cb8900",
        footerText: `Author ID: ${message.author.id} | Channel ID: ${message.channel.id} | Message ID: ${message.id}`,
        timestamp: true,
    });

    embed
        .setTitle("Message deleted")
        .addFields({ name: "Channel", value: `${message.channel}` });

    if (message.content) {
        embed.addFields({
            name: "Content",
            value: message.content.substring(0, 1025),
        });
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging deleted messages.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
