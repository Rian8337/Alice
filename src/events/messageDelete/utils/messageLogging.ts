import { GuildChannel, Message, MessageEmbed, ThreadChannel } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.author?.bot) {
        return;
    }

    const logChannel: GuildChannel | ThreadChannel | undefined =
        message.guild?.channels.cache.find(
            (c) => c.id === "643770576238018570"
        );

    if (!logChannel?.isText()) {
        return;
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: message.author,
        color: "#cb8900",
        footerText: `Author ID: ${message.author.id} | Channel ID: ${message.channel.id} | Message ID: ${message.id}`,
        timestamp: true,
    });

    embed.setTitle("Message deleted").addField("Channel", `${message.channel}`);

    if (message.content) {
        embed.addField("Content", message.content.substring(0, 1025));
    }

    logChannel.send({ embeds: [embed] });
};

export const config: EventUtil["config"] = {
    description: "Responsible for logging deleted messages.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
