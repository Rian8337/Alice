import { Snowflake } from "discord.js";
import { ChallengeCompletionData } from "structures/challenge/ChallengeCompletionData";
import { ProfileImageConfig } from "@structures/profile/ProfileImageConfig";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents an information about a Discord user regarding the bot
 * (amount of Mahiru coins and its streak, daily/weekly challenges status, profile
 * picture format, etc).
 */
export interface DatabasePlayerInfo extends BaseDocument {
    /**
     * The username of the osu!droid account bound to the user.
     */
    username: string;

    /**
     * The UID of the osu!droid account bound to the user.
     */
    uid: number;

    /**
     * The Discord ID of the user.
     */
    discordid: Snowflake;

    /**
     * Information about daily/weekly challenge completions.
     */
    challenges: ChallengeCompletionData[];

    /**
     * The amount of points the user has from playing daily/weekly challenges.
     */
    points: number;

    /**
     * The amount of Mahiru coins the user has.
     */
    coins: number;

    /**
     * The amount of daily coins claim streak the user has.
     */
    streak: number;

    /**
     * Configuration for profile image.
     */
    picture_config: ProfileImageConfig;

    /**
     * The epoch time at which daily coins claim will be reset,
     * in seconds.
     *
     * This is only available under user ID `386742340968120321`.
     */
    dailyreset?: number;

    /**
     * Whether the user has submitted a beatmap to share.
     */
    hasSubmittedMapShare: boolean;

    /**
     * Whether the user has claimed daily coins.
     */
    hasClaimedDaily: boolean;

    /**
     * Whether the user is banned from sharing beatmaps in map share.
     */
    isBannedFromMapShare: boolean;

    /**
     * The amount of Mahiru coins the user has transferred to other user.
     */
    transferred: number;
}
