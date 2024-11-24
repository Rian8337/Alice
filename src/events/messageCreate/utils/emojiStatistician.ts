import { Collection, Message, Snowflake } from "discord.js";
import { DatabaseManager } from "@database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { EmojiStatistics } from "@database/utils/aliceDb/EmojiStatistics";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (!message.inGuild() || message.author.bot) {
        return;
    }

    const emojiMessages = message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g);

    if (!emojiMessages) {
        return;
    }

    const emojiDataCache = new Collection<Snowflake, EmojiStatistics>();
    const dbManager = DatabaseManager.aliceDb.collections.emojiStatistics;

    for (const emojiMessage of emojiMessages) {
        const emojiId = <Snowflake>(
            (<string>emojiMessage.split(":").pop()).replace(">", "")
        );

        const actualEmoji = message.guild.emojis.cache.find(
            (e) => e.id === emojiId,
        );

        if (!actualEmoji) {
            continue;
        }

        const emojiData =
            (await dbManager.getEmojiStatistics(emojiId)) ??
            new EmojiStatistics({
                guildId: message.guildId!,
                emojiId: emojiId,
                count: 0,
            });

        ++emojiData.count;

        emojiDataCache.set(emojiId, emojiData);
    }

    for (const [emojiId, emojiData] of emojiDataCache) {
        await dbManager.updateOne(
            { emojiId: emojiId },
            {
                $set: { count: emojiData.count },
                $setOnInsert: { guildId: message.guildId! },
            },
            { upsert: true },
        );
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for collecting emoji usage data of a guild.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
