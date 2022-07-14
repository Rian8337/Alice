import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { DatabaseNameChange } from "structures/database/aliceDb/DatabaseNameChange";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";
import { Collection as DiscordCollection, Snowflake, User } from "discord.js";
import { OperationResult } from "structures/core/OperationResult";

/**
 * A manager for the `namechange` collection.
 */
export class NameChangeCollectionManager extends DatabaseCollectionManager<
    DatabaseNameChange,
    NameChange
> {
    protected override readonly utilityInstance: new (
        data: DatabaseNameChange
    ) => NameChange = NameChange;

    override get defaultDocument(): DatabaseNameChange {
        return {
            cooldown: Math.floor(Date.now() / 1000),
            discordid: "",
            isProcessed: false,
            new_username: "",
            previous_usernames: [],
            uid: 0,
        };
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
     * Gets name change request of a Discord user.
     *
     * @param user The user.
     */
    getFromUser(user: User): Promise<NameChange | null>;

    /**
     * Gets name change request of a Discord user.
     *
     * @param userId The ID of the user.
     */
    getFromUser(userId: Snowflake): Promise<NameChange | null>;

    getFromUser(userOrId: User | Snowflake): Promise<NameChange | null> {
        return this.getOne({
            discordid: userOrId instanceof User ? userOrId.id : userOrId,
        });
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
        return this.updateOne(
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
