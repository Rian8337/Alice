import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Collection, Guild, Message, MessageEmbed, Snowflake, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    const excludedChannels: Snowflake[] = [
        "360716684174032896"
    ];

    setInterval(async () => {
        if (Config.maintenance || CommandUtilManager.globallyDisabledEventUtils.get("ready")?.includes("reportBroadcast")) {
            return;
        }

        const executionTime: number = Date.now();

        const guild: Guild = await client.guilds.fetch(Constants.mainServer);

        await guild.channels.fetch();

        const embed: MessageEmbed = EmbedCreator.createReportBroadcastEmbed(guild);

        for await (const channel of guild.channels.cache.values()) {
            if (!(channel instanceof TextChannel) || excludedChannels.includes(channel.id)) {
                continue;
            }

            // Check if channel has active conversation; check based on messages per second
            const lastMessage: Message | undefined = (await channel.messages.fetch({ limit: 1 }))?.first();

            if (!lastMessage) {
                continue;
            }

            // Check if last message is too old
            // We're checking a condition such that 100 messages are sent in the past 5 minutes prior to utility execution.
            const timeThreshold: number = 3e5;
            const messageThreshold: number = 100;

            if (executionTime - lastMessage.createdTimestamp > timeThreshold) {
                continue;
            }

            const messages: Collection<string, Message> = (await channel.messages.fetch({ limit: 100, before: lastMessage.id })).filter(v => !v.author.bot && executionTime - v.createdTimestamp <= timeThreshold);

            if (messages.size < messageThreshold) {
                continue;
            }

            await channel.send({embeds: [embed]});
        }
    }, 60 * 60 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for occasionally broadcasting report announcement",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};