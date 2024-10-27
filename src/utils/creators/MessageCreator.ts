import { Symbols } from "@enums/utils/Symbols";
import { StringHelper } from "@utils/helpers/StringHelper";
import { bold } from "discord.js";

/**
 * A utility to create messages that will be sent to the user.
 */
export abstract class MessageCreator {
    /**
     * Creates a message indicating a success to be sent
     * to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createAccept(content: string, ...args: string[]): string {
        return this.createPrefixedMessage(content, Symbols.checkmark, ...args);
    }

    /**
     * Creates a message indicating a rejection to be sent
     * to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createReject(content: string, ...args: string[]): string {
        return this.createPrefixedMessage(content, Symbols.cross, ...args);
    }

    /**
     * Creates a message indicating a warning to be sent
     * to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createWarn(content: string, ...args: string[]): string {
        // No space after symbol is intentional.
        return `${Symbols.exclamationMark}${bold(
            `| ${StringHelper.formatString(content, ...args)}`,
        )}`;
    }

    /**
     * Creates a custom prefixed message to be sent
     * to the user.
     *
     * @param content The content of the message. This will automatically be formatted.
     * @param prefix The prefix of the message.
     * @param args Additional arguments to format the content of the message.
     * @returns The message to be sent to the user.
     */
    static createPrefixedMessage(
        content: string,
        prefix: Symbols,
        ...args: string[]
    ): string {
        return `${prefix} ${bold(
            `| ${StringHelper.formatString(content, ...args)}`,
        )}`;
    }
}
