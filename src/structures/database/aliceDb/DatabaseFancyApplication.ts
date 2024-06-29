import { Snowflake } from "discord.js";
import { BaseDocument } from "../BaseDocument";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";
import { FancyApplicationVote } from "@alice-structures/utils/FancyApplicationVote";

/**
 * Represents a fancy lounge application.
 */
export interface DatabaseFancyApplication extends BaseDocument {
    /**
     * The ID of the user who applied.
     */
    readonly discordId: Snowflake;

    readonly createdAt: Date;

    /**
     * The status of the fancy application.
     */
    readonly status: FancyApplicationStatus;

    /**
     * The ID of the message that contains the fancy application.
     */
    readonly applicationApprovalMessageId: Snowflake;

    /**
     * The ongoing vote of the fancy application.
     */
    readonly vote?: FancyApplicationVote;

    /**
     * The reason for rejecting the application.
     */
    readonly rejectReason?: string;
}
