import { Message, MessageEmbed } from "discord.js";
import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EightBallResponseType } from "@alice-enums/utils/EightBallResponseType";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { DatabaseEightBallFilter } from "@alice-interfaces/database/aliceDb/DatabaseEightBallFilter";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { EightBallFilter } from "@alice-database/utils/aliceDb/EightBallFilter";

/**
 * Gets the response type to a message.
 *
 * @param message The message to get the response type of.
 * @param filter The filter for 8ball.
 * @returns The response type.
 */
function getResponseType(
    message: Message,
    filter: DatabaseEightBallFilter
): EightBallResponseType {
    function containsWord(words: string[]): boolean {
        return words.some(
            (w) => message.content.search(new RegExp(w, "i")) !== -1
        );
    }

    let returnValue: EightBallResponseType = EightBallResponseType.UNDECIDED;

    if (Config.botOwners.includes(message.author.id)) {
        switch (true) {
            case containsWord(filter.like):
                returnValue = EightBallResponseType.LIKE;
                break;
            case containsWord(filter.hate):
                returnValue = EightBallResponseType.HATE;
                break;
            case containsWord(filter.badwords):
                returnValue = EightBallResponseType.NEUTRAL;
                break;
        }
    } else if (containsWord(filter.badwords)) {
        returnValue = EightBallResponseType.NO_ANSWER;
    }

    return returnValue;
}

export const run: EventUtil["run"] = async (_, message: Message) => {
    if (
        (!message.content.startsWith("Alice, ") &&
            !(
                message.author.id === "386742340968120321" &&
                message.content.startsWith("Dear, ")
            )) ||
        !message.content.endsWith("?") ||
        Config.maintenance ||
        message.author.bot
    ) {
        return;
    }

    const res: EightBallFilter = (
        await DatabaseManager.aliceDb.collections.eightBallFilter.get("name", {
            name: "response",
        })
    ).first()!;

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: message.author,
        color: message.member?.displayColor,
    });
    const responseType: EightBallResponseType = getResponseType(message, res);

    let answer: string = "";
    switch (responseType) {
        case EightBallResponseType.LIKE:
            answer = "Yes, absolutely.";
            break;
        case EightBallResponseType.HATE:
            answer = "N... No! I would never think of that...";
            break;
        case EightBallResponseType.NEUTRAL:
            answer = "Um... Uh...";
            break;
        case EightBallResponseType.NO_ANSWER:
            answer = "Uh, I don't think I want to answer that.";
            break;
        default:
            answer = ArrayHelper.getRandomArrayElement(res.response);
    }

    embed.setDescription(`**Q**: ${message.content}\n**A**: ${answer}`);

    message.channel.send({
        embeds: [embed],
    });

    DatabaseManager.aliceDb.collections.askCount.updateOne(
        { discordid: message.author.id },
        { $inc: { count: 1 } },
        { upsert: true }
    );
};

export const config: EventUtil["config"] = {
    description:
        'Responsible for responding to questions prefixed with "Alice, ".',
    togglePermissions: ["MANAGE_CHANNELS"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
