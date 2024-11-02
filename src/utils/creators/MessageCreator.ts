import { Config } from "@core/Config";
import { StringHelper } from "@utils/helpers/StringHelper";
import { bold, formatEmoji } from "discord.js";

/**
 * A utility to create messages that will be sent to the user.
 */
export abstract class MessageCreator {
    private static readonly acceptPrefix = formatEmoji(
        Config.isDebug ? "1300058883364225104" : "1300047299548024942",
    );
    private static readonly rejectPrefix = formatEmoji(
        Config.isDebug ? "1300058912279761011" : "1300047123554762772",
    );
    private static readonly warnPrefix = formatEmoji(
        Config.isDebug ? "1300058934811295846" : "1300047227116585020",
    );

    /**
     * Creates a message indicating a success to be sent to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createAccept(content: string, ...args: string[]): string {
        return this.createPrefixedMessage(content, this.acceptPrefix, ...args);
    }

    /**
     * Creates a message indicating a rejection to be sent to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createReject(content: string, ...args: string[]): string {
        return this.createPrefixedMessage(content, this.rejectPrefix, ...args);
    }

    /**
     * Creates a message indicating a warning to be sent to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createWarn(content: string, ...args: string[]): string {
        return this.createPrefixedMessage(content, this.warnPrefix, ...args);
    }

    /**
     * Creates a custom prefixed message to be sent to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param prefix The prefix of the message.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createPrefixedMessage(
        content: string,
        prefix: string,
        ...args: string[]
    ): string {
        return `${prefix} ${bold(
            `| ${StringHelper.formatString(content, ...args)}`,
        )}`;
    }
}
