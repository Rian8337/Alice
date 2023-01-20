import { ChannelActivityData } from "@alice-structures/utils/ChannelActivityData";
import { BaseDocument } from "../BaseDocument";

/**
 * Represents a channel's activity in a day.
 */
export interface DatabaseChannelActivity extends BaseDocument {
    /**
     * The epoch time of the data, in milliseconds.
     *
     * Since a channel's activity is stored in a per day basis, this timestamp
     * will always be at 00:00 UTC of a day.
     */
    timestamp: number;

    /**
     * The activity data of channels within the timestamp.
     */
    channels: ChannelActivityData[];
}
