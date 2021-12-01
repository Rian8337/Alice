import { ClanMember } from "@alice-interfaces/clan/ClanMember";
import { Powerup } from "@alice-interfaces/clan/Powerup";
import { PowerupType } from "@alice-types/clan/PowerupType";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a clan in the database.
 */
export interface DatabaseClan extends BaseDocument {
    /**
     * The name of the clan.
     */
    name: string;

    /**
     * The power of the clan.
     */
    power: number;

    /**
     * The epoch time at which the clan was created.
     */
    createdAt: number;

    /**
     * The Discord ID of the clan leader.
     */
    leader: Snowflake;

    /**
     * The clan's description.
     */
    description: string;

    /**
     * The ID of the message that contains the icon of the clan.
     */
    iconMessage: Snowflake;

    /**
     * The URL of the clan's icon.
     */
    iconURL: string;

    /**
     * The ID of the message that contains the banner of the clan.
     */
    bannerMessage: Snowflake;

    /**
     * The URL of the clan's banner.
     */
    bannerURL: string;

    /**
     * The epoch time at which the clan can change their icon again, in seconds.
     */
    iconcooldown: number;

    /**
     * The epoch time at which the clan can change their banner again, in seconds.
     */
    bannercooldown: number;

    /**
     * The epoch time at which the clan can change their name again, in seconds.
     */
    namecooldown: number;

    /**
     * The epoch time at which the weekly upkeep of the clan will be taken, in seconds.
     */
    weeklyfee: number;

    /**
     * Whether the clan is currently in match mode.
     */
    isMatch: boolean;

    /**
     * Whether the clan can change their role's color.
     */
    roleColorUnlocked: boolean;

    /**
     * Whether the clan can change their role's icon.
     */
    roleIconUnlocked: boolean;

    /**
     * The powerups that the clan owns.
     */
    powerups: Powerup[];

    /**
     * The active powerups of the clan.
     */
    active_powerups: PowerupType[];

    /**
     * The members of the clan.
     */
    member_list: ClanMember[];
}
