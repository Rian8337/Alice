import { Bonus } from "@alice-interfaces/challenge/Bonus";
import { BaseDocument } from "../BaseDocument";
import { PassRequirement } from "@alice-interfaces/challenge/PassRequirement";
import { Snowflake } from "discord.js";

/**
 * Represents a daily or weekly challenge.
 */
export interface DatabaseChallenge extends BaseDocument {
    /**
     * The ID of the challenge.
     */
    challengeid: string;

    /**
     * The ID of the beatmap in the challenge.
     */
    beatmapid: number;

    /**
     * The Discord ID of the user who featured the challenge.
     */
    featured: Snowflake;

    /**
     * The download links to the challenge beatmapset.
     *
     * The first element is the download link via Google Drive,
     * the second element is the download link via OneDrive.
     */
    link: [string, string];

    /**
     * The status of the challenge.
     */
    status: "scheduled" | "ongoing" | "finished";

    /**
     * The MD5 hash of the challenge beatmapset.
     */
    hash: string;

    /**
     * The mods required to complete this challenge.
     */
    constrain: string;

    /**
     * The amount of points awarded for completing the challenge.
     */
    points: number;

    /**
     * The epoch time at which the challenge will end, in seconds.
     */
    timelimit: number;

    /**
     * The pass condition of the challenge.
     */
    pass: PassRequirement;

    /**
     * The bonuses for the challenge.
     */
    bonus: Bonus[];
}
