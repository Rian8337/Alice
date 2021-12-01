import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { DatabaseNameChange } from "@alice-interfaces/database/aliceDb/DatabaseNameChange";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as DiscordCollection, Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

/**
 * A manager for the `namechange` collection.
 */
export class NameChangeCollectionManager extends DatabaseCollectionManager<
    DatabaseNameChange,
    NameChange
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseNameChange,
        NameChange
    >;

    override get defaultDocument(): DatabaseNameChange {
        return {
            cooldown: Math.floor(Date.now() / 1000),
            current_username: "",
            discordid: "",
            isProcessed: false,
            new_username: "",
            previous_usernames: [],
            uid: 0,
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<DatabaseNameChange>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseNameChange, NameChange>
        >new NameChange().constructor;
    }

    /**
     * Gets name change request from a uid.
     *
     * @param uid The uid.
     */
    getFromUid(uid: number): Promise<NameChange | null> {
        return this.getOne({ uid: uid });
    }

    /**
     * Gets name change requests that are currently active.
     */
    getActiveNameChangeRequests(): Promise<
        DiscordCollection<number, NameChange>
    > {
        return this.get("uid", { isProcessed: false });
    }

    /**
     * Requests a name change.
     *
     * @param discordId The Discord ID of the player.
     * @param uid The uid of the player.
     * @param currentUsername The current username of the player.
     * @param newUsername The new username that is requested by the player.
     * @returns An object containing information about the operation.
     */
    requestNameChange(
        discordId: Snowflake,
        uid: number,
        currentUsername: string,
        newUsername: string
    ): Promise<OperationResult> {
        return this.update(
            { uid: uid },
            {
                $set: {
                    new_username: newUsername,
                    cooldown: Math.floor(Date.now() / 1000) + 86400 * 30,
                    isProcessed: false,
                },
                $setOnInsert: {
                    discordid: discordId,
                    current_username: currentUsername,
                    previous_usernames: [],
                },
            },
            { upsert: true }
        );
    }
}
