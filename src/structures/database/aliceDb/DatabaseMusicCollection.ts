import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a music collection.
 */
export interface DatabaseMusicCollection extends BaseDocument {
    /**
     * The epoch time at which this collection was made, in milliseconds.
     */
    createdAt: number;

    /**
     * The name of the collection.
     */
    name: string;

    /**
     * The Discord ID of the collection's owner.
     */
    owner: Snowflake;

    /**
     * The IDs of musics in this collection.
     *
     * Basically, the IDs of each YouTube video.
     */
    videoIds: string[];
}
