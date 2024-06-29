import { DatabaseFancyApplication } from "@alice-structures/database/aliceDb/DatabaseFancyApplication";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { FancyApplication } from "@alice-database/utils/aliceDb/FancyApplication";
import { FindOptions } from "mongodb";
import { Snowflake } from "discord.js";
import { FancyApplicationStatus } from "@alice-enums/utils/FancyApplicationStatus";

/**
 * A manager for the `fancyapplication` collection.
 */
export class FancyApplicationCollectionManager extends DatabaseCollectionManager<
    DatabaseFancyApplication,
    FancyApplication
> {
    protected override utilityInstance: new (
        data: DatabaseFancyApplication,
    ) => FancyApplication = FancyApplication;

    override get defaultDocument(): DatabaseFancyApplication {
        return {
            applicationApprovalMessageId: "",
            discordId: "",
            createdAt: new Date(),
            status: FancyApplicationStatus.pendingApproval,
        };
    }

    /**
     * Gets a fancy application by the ID of the user who applied.
     *
     * @param id The ID of the user.
     * @param options Options for the retrieval of the fancy application.
     * @returns The fancy application, `null` if not found.
     */
    getByUserId(
        id: Snowflake,
        options?: FindOptions<DatabaseFancyApplication>,
    ): Promise<FancyApplication | null> {
        return this.getOne({ discordId: id }, options);
    }

    /**
     * Gets the active fancy application of a user.
     *
     * @param id The ID of the user.
     * @param options Options for the retrieval of the fancy application.
     * @return The fancy application, `null` if not found.
     */
    getUserActiveApplication(
        id: Snowflake,
        options?: FindOptions<DatabaseFancyApplication>,
    ): Promise<FancyApplication | null> {
        return this.getOne(
            {
                discordId: id,
                status: {
                    $in: [
                        FancyApplicationStatus.pendingApproval,
                        FancyApplicationStatus.inReview,
                        FancyApplicationStatus.inVote,
                    ],
                },
            },
            options,
        );
    }

    /**
     * Gets a fancy application by the ID of the message.
     *
     * @param id The ID of the message.
     * @param options Options for the retrieval of the fancy application.
     * @returns The fancy application, `null` if not found.
     */
    getByMessageId(
        id: Snowflake,
        options?: FindOptions<DatabaseFancyApplication>,
    ): Promise<FancyApplication | null> {
        return this.getOne({ messageId: id }, options);
    }
}
