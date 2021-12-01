import { Snowflake } from "discord.js";

/**
 * Constants that are used throughout the bot.
 */
export class Constants {
    /**
     * Default message to send when a user doesn't meet required permissions to use a command.
     */
    static readonly noPermissionReject: string =
        "I'm sorry, you do not have the permission to execute this command.";

    /**
     * Default message to send when a database operation fails.
     */
    static readonly databaseErrorReject: string =
        "I'm sorry, I'm having trouble receiving response from database. Please try again!";

    /**
     * Default message to send when a Discord user doesn't have a binded osu!droid account.
     */
    static readonly selfNotBindedReject: string =
        "I'm sorry, your account is not binded. You need to bind your account using `/userbind` first.";

    /**
     * Default message to send when a command is not available in a server.
     */
    static readonly notAvailableInServerReject: string =
        "I'm sorry, this command is not available in this server.";

    /**
     * Default message to send when a command is not available in a channel.
     */
    static readonly notAvailableInChannelReject: string =
        "I'm sorry, this command is not available in this channel.";

    /**
     * Default message to send when a user (third-person) doesn't have a binded osu!droid account.
     */
    static readonly userNotBindedReject: string =
        "I'm sorry, that account is not binded. The user needs to bind his/her account using `/userbind` first.";

    /**
     * Default message to send when an API request towards the osu!droid server fails.
     */
    static readonly droidApiRequestFail: string =
        "I'm sorry, I'm having trouble receiving response from osu!droid server. Please try again!";

    /**
     * The ID of main guild.
     */
    static readonly mainServer: Snowflake = "316545691545501706";

    /**
     * The ID of testing guild.
     */
    static readonly testingServer: Snowflake = "528941000555757598";

    /**
     * The ID of lounge channel in main server.
     */
    static readonly loungeChannel: Snowflake = "667400988801368094";

    /**
     * The ID of verification channel in main server.
     */
    static readonly verificationChannel: Snowflake = "885365138453041152";

    /**
     * The link to welcome image (used to welcome new members to the server).
     */
    static readonly welcomeImageLink: string =
        "https://i.imgur.com/LLzteLz.jpg";

    /**
     * The uid limit that is used to check if a uid from a user's input is too small.
     */
    static readonly uidMinLimit: number = 2417;

    /**
     * The uid limit that is used to check if a uid from a user's input is too big.
     */
    static readonly uidMaxLimit: number = 500000;

    /**
     * The ID of the Alice coins emote.
     */
    static readonly aliceCoinEmote: Snowflake = "669532330980802561";

    /**
     * The ID of the channel that is storing tag attachments.
     */
    static readonly tagAttachmentChannel: Snowflake = "695521921441333308";

    /**
     * The ID of the channel for managing map share submissions.
     */
    static readonly mapShareChannel: Snowflake = "715423228461449297";
}
