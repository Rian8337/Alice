import { MapShareSubmissionStatus } from "structures/utils/MapShareSubmissionStatus";
import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a shared beatmap.
 */
export interface DatabaseMapShare extends BaseDocument {
    /**
     * The ID of the beatmap.
     */
    beatmap_id: number;

    /**
     * The MD5 hash of the beatmap.
     */
    hash: string;

    /**
     * The name of the submitter.
     */
    submitter: string;

    /**
     * The Discord ID of the submitter.
     */
    id: Snowflake;

    /**
     * The epoch time at which the beatmap was shared, in seconds.
     */
    date: number;

    /**
     * A summary of the beatmap, written by the submitter.
     */
    summary: string;

    /**
     * The status of the shared beatmap submission.
     */
    status: MapShareSubmissionStatus;
}
