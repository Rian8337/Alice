import { ConstantsStrings } from "@alice-localization/core/constants/ConstantsLocalization";
import { Snowflake } from "discord.js";

/**
 * Constants that are used throughout the bot.
 */
export class Constants {
    /**
     * Default message to send when a user doesn't meet required permissions to use a command.
     */
    static readonly noPermissionReject =
        "noPermissionToExecuteCommand" satisfies keyof ConstantsStrings;

    /**
     * Default message to send when a Discord user doesn't have a bound osu!droid account.
     */
    static readonly selfNotBindedReject =
        "selfAccountNotBinded" satisfies keyof ConstantsStrings;

    /**
     * Default message to send when a command is not available in a server.
     */
    static readonly notAvailableInServerReject =
        "commandNotAvailableInServer" satisfies keyof ConstantsStrings;

    /**
     * Default message to send when a command is not available in a channel.
     */
    static readonly notAvailableInChannelReject =
        "commandNotAvailableInChannel" satisfies keyof ConstantsStrings;

    /**
     * Default message to send when a user (third-person) doesn't have a bound osu!droid account.
     */
    static readonly userNotBindedReject =
        "userAccountNotBinded" satisfies keyof ConstantsStrings;

    /**
     * The ID of main guild.
     */
    static readonly mainServer = "316545691545501706" satisfies Snowflake;

    /**
     * The ID of testing guild.
     */
    static readonly testingServer = "528941000555757598" satisfies Snowflake;

    /**
     * The ID of the lounge channel in the main server.
     */
    static readonly loungeChannel = "927204556683771945" satisfies Snowflake;

    /**
     * The ID of the lounge role in the main server.
     */
    static readonly loungeRole = "667403004118433793" satisfies Snowflake;

    /**
     * The link to welcome image (used to welcome new members to the server).
     */
    static readonly welcomeImageLink =
        "https://cdn.discordapp.com/attachments/316545691545501706/1101147416410984478/LLzteLz.jpg";

    /**
     * The uid limit that is used to check if a uid from a user's input is too small.
     */
    static readonly uidMinLimit = 2417;

    /**
     * The uid limit that is used to check if a uid from a user's input is too big.
     */
    static readonly uidMaxLimit = 500000;

    /**
     * The ID of the Alice coins emote.
     */
    static readonly aliceCoinEmote = "669532330980802561" satisfies Snowflake;

    /**
     * The ID of the channel that is storing tag attachments.
     */
    static readonly tagAttachmentChannel =
        "695521921441333308" satisfies Snowflake;

    /**
     * The ID of the channel for managing map share submissions.
     */
    static readonly mapShareChannel = "715423228461449297" satisfies Snowflake;

    /**
     * The ID of the channel that is storing skin previews.
     */
    static readonly skinPreviewChannel =
        "999480010459070505" satisfies Snowflake;

    /**
     * The ID of the channel that tracks support ticket statuses for staff members.
     */
    static readonly supportTicketStaffChannel =
        "1201375042223751289" satisfies Snowflake;

    /**
     * The ID of the support ticket channel for users.
     */
    static readonly supportTicketUserChannel =
        "1201421169061019738" satisfies Snowflake;

    /**
     * The ID of the linked role for displaying dpp statistics in user profiles.
     */
    static readonly dppProfileDisplayerRole =
        "1082254268691644446" satisfies Snowflake;
}
