import { ConstantsStrings } from "@alice-localization/core/constants/ConstantsLocalization";
import { Snowflake } from "discord.js";

/**
 * Constants that are used throughout the bot.
 */
export class Constants {
    /**
     * Default message to send when a user doesn't meet required permissions to use a command.
     */
    static readonly noPermissionReject: keyof ConstantsStrings =
        "noPermissionToExecuteCommand";

    /**
     * Default message to send when a Discord user doesn't have a bound osu!droid account.
     */
    static readonly selfNotBindedReject: keyof ConstantsStrings =
        "selfAccountNotBinded";

    /**
     * Default message to send when a command is not available in a server.
     */
    static readonly notAvailableInServerReject: keyof ConstantsStrings =
        "commandNotAvailableInServer";

    /**
     * Default message to send when a command is not available in a channel.
     */
    static readonly notAvailableInChannelReject: keyof ConstantsStrings =
        "commandNotAvailableInChannel";

    /**
     * Default message to send when a user (third-person) doesn't have a bound osu!droid account.
     */
    static readonly userNotBindedReject: keyof ConstantsStrings =
        "userAccountNotBinded";

    /**
     * The ID of main guild.
     */
    static readonly mainServer: Snowflake = "316545691545501706";

    /**
     * The ID of testing guild.
     */
    static readonly testingServer: Snowflake = "528941000555757598";

    /**
     * The ID of the lounge channel in the main server.
     */
    static readonly loungeChannel: Snowflake = "927204556683771945";

    /**
     * The ID of the lounge role in the main server.
     */
    static readonly loungeRole: Snowflake = "667403004118433793";

    /**
     * The link to welcome image (used to welcome new members to the server).
     */
    static readonly welcomeImageLink: string =
        "https://cdn.discordapp.com/attachments/316545691545501706/1101147416410984478/LLzteLz.jpg";

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

    /**
     * The ID of the channel that is storing skin previews.
     */
    static readonly skinPreviewChannel: Snowflake = "999480010459070505";

    /**
     * The ID of the linked role for displaying dpp statistics in user profiles.
     */
    static readonly dppProfileDisplayerRole: Snowflake = "1082254268691644446";
}
