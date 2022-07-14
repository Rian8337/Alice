import {
    Collection,
    DMChannel,
    GuildEmoji,
    Message,
    Snowflake,
} from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { EmojiStat } from "structures/moderation/EmojiStat";
import { EmojiStatistics } from "@alice-database/utils/aliceDb/EmojiStatistics";

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (message.channel instanceof DMChannel || message.author.bot) {
        return;
    }

    const emojiMessages: RegExpMatchArray =
        message.content.match(/<a:.+?:\d+>|<:.+?:\d+>/g) ?? [];

    const guildEmojiData: EmojiStatistics | null =
        await DatabaseManager.aliceDb.collections.emojiStatistics.getGuildStatistics(
            message.guild!.id
        );

    const guildEmojiStats: Collection<Snowflake, EmojiStat> =
        guildEmojiData?.emojiStats ?? new Collection();

    for (const emojiMessage of emojiMessages) {
        const emojiID: Snowflake = <Snowflake>(
            (<string>emojiMessage.split(":").pop()).replace(">", "")
        );

        const actualEmoji: GuildEmoji | undefined =
            message.guild!.emojis.cache.find((e) => e.id === emojiID);

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
        { upsert: true }
    );
};

export const config: EventUtil["config"] = {
    description: "Responsible for collecting emoji usage data of a guild.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
