import { Collection, Message, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.channel.isDMBased() || message.author.bot) {
        return;
    }

    const emojiMessages = message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g);

    if (!emojiMessages) {
        return;
    }

    const guildEmojiData =
        await DatabaseManager.aliceDb.collections.emojiStatistics.getGuildStatistics(
            message.guild!.id,
        );

    const guildEmojiStats = guildEmojiData?.emojiStats ?? new Collection();

    for (const emojiMessage of emojiMessages) {
        const emojiID = <Snowflake>(
            (<string>emojiMessage.split(":").pop()).replace(">", "")
        );

        const actualEmoji = message.guild!.emojis.cache.find(
            (e) => e.id === emojiID,
        );

        if (!actualEmoji) {
            return;
        }

        guildEmojiStats.set(actualEmoji.id, {
            id: actualEmoji.id,
            count: (guildEmojiStats.get(actualEmoji.id)?.count ?? 0) + 1,
        });
    }

    await DatabaseManager.aliceDb.collections.emojiStatistics.updateOne(
        { guildID: message.guild?.id },
        { $set: { emojiStats: [...guildEmojiStats.values()] } },
        { upsert: true },
    );
};

export const config: EventUtil["config"] = {
    description: "Responsible for collecting emoji usage data of a guild.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
