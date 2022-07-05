import { BaseDocument } from "../BaseDocument";

/**
 * Represents a player whose account was deleted due to the *incident*.
 *
 * Keep in mind that this information is temporary, but immutable, and should not be changed.
 */
export interface DatabaseRestoredPlayerCredentials extends BaseDocument {
    /**
     * The uid of the player.
     */
    readonly Id: number;

    /**
     * The username of the player.
     */
    readonly Username: string;

    /**
     * The password of the player.
     */
    readonly Password: string;

    /**
     * The email of the player.
     */
    readonly Email: string;

    /**
     * The device ID of the player.
     */
    readonly DeviceId: string;

    /**
     * The score of the player.
     */
    readonly Score: number;

    /**
     * The play count of the player.
     */
    readonly Playcount: number;

    /**
     * The accuracy of the player.
     */
    readonly Accuracy: number;

    /**
     * The registration time of the player, in ISO date format.
     */
    readonly RegistTime: string;

    /**
     * The last login time of the player, in ISO date format.
     */
    readonly LastLoginTime: string;

    /**
     * The IP address at which the player registered.
     */
    readonly RegistIp: string;

    /**
     * The region of the player.
     */
    readonly Region: string;

    /**
     * Whether the player is active.
     */
    readonly Active: boolean;

    /**
     * Whether the player is a supporter.
     */
    readonly Supporter: boolean;

    /**
     * Whether the player is banned.
     */
    readonly Banned: boolean;

    /**
     * Whether the player is restricted.
     */
    readonly RestrictMode: boolean;
}
