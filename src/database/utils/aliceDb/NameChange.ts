import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseNameChange } from "@alice-interfaces/database/aliceDb/DatabaseNameChange";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

/**
 * Represents an osu!droid name change request.
 */
export class NameChange extends Manager implements DatabaseNameChange {
    discordid: Snowflake;
    current_username: string;
    new_username: string | null;
    uid: number;
    cooldown: number;
    isProcessed: boolean;
    previous_usernames: string[];
    readonly _id?: ObjectId;

    constructor(data: DatabaseNameChange = DatabaseManager.aliceDb.collections.nameChange.defaultDocument) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.current_username = data.current_username;
        this.new_username = data.new_username;
        this.uid = data.uid;
        this.cooldown = data.cooldown;
        this.isProcessed = data.isProcessed;
        this.previous_usernames = data.previous_usernames ?? [];
    }

    /**
     * Accepts the name change request if this account requests a name change.
     * 
     * @returns An object containing information about the operation.
     */
    async accept(): Promise<DatabaseOperationResult> {
        if (this.isProcessed) {
            return this.createOperationResult(false, "no active name change requset");
        }

        await DatabaseManager.elainaDb.collections.userBind.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
            );

        await DatabaseManager.aliceDb.collections.playerInfo.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
        );

        await DatabaseManager.aliceDb.collections.rankedScore.update(
            { uid: this.uid },
            { $set: { username: this.new_username! } }
        );

        this.isProcessed = true;

        const result: DatabaseOperationResult = await DatabaseManager.aliceDb.collections.nameChange.update(
            { uid: this.uid },
            {
                $set: {
                    current_username: this.new_username!,
                    new_username: null,
                    isProcessed: true
                },
                $push: {
                    previous_usernames: this.current_username
                }
            }
        );

        this.current_username = this.new_username!;
        this.new_username = null;

        return result;
    }

    /**
     * Accepts the name change request if this account requests a name change.
     * 
     * @returns An object containing information about the operation.
     */
    async deny(): Promise<DatabaseOperationResult> {
        if (this.isProcessed) {
            return this.createOperationResult(false, "no active name change requset");
        }

        this.new_username = null;
        this.isProcessed = true;

        return DatabaseManager.aliceDb.collections.nameChange.update(
            { uid: this.uid },
            {
                $inc: {
                    cooldown: -86400 * 30
                },
                $set: {
                    new_username: null,
                    isProcessed: true
                }
            }
        );
    }
}