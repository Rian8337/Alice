import { Message, EmbedBuilder } from "discord.js";
import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EightBallResponseType } from "@alice-enums/utils/EightBallResponseType";
import { EventUtil } from "structures/core/EventUtil";
import { DatabaseEightBallFilter } from "structures/database/aliceDb/DatabaseEightBallFilter";
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

    let returnValue: EightBallResponseType = EightBallResponseType.undecided;

    if (Config.botOwners.includes(message.author.id)) {
        switch (true) {
            case containsWord(filter.like):
                returnValue = EightBallResponseType.like;
                break;
            case containsWord(filter.hate):
                returnValue = EightBallResponseType.hate;
                break;
            case containsWord(filter.badwords):
                returnValue = EightBallResponseType.neutral;
                break;
        }
    } else if (containsWord(filter.badwords)) {
        returnValue = EightBallResponseType.noAnswer;
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

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        author: message.author,
        color: message.member?.displayColor,
    });
    const responseType: EightBallResponseType = getResponseType(message, res);

    let answer: string = "";
    switch (responseType) {
        case EightBallResponseType.like:
            answer = "Yes, absolutely.";
            break;
        case EightBallResponseType.hate:
            answer = "N... No! I would never think of that...";
            break;
        case EightBallResponseType.neutral:
            answer = "Um... Uh...";
            break;
        case EightBallResponseType.noAnswer:
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
    togglePermissions: ["ManageChannels"],
    toggleScope: ["GLOBAL", "GUILD", "CHANNEL"],
};
