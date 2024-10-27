import { DatabaseManager } from "@database/DatabaseManager";
import { DatabaseAccountTransfer } from "@structures/database/aliceDb/DatabaseAccountTransfer";
import { Manager } from "@utils/base/Manager";
import { Snowflake } from "discord.js";
import { ObjectId } from "mongodb";

/**
 * Represents an osu!droid account transfer of a user.
 */
export class AccountTransfer
    extends Manager
    implements DatabaseAccountTransfer
{
    readonly discordId: Snowflake;
    transferUid: number;
    transferList: number[];
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseAccountTransfer = DatabaseManager.aliceDb?.collections
            .accountTransfer.defaultDocument ?? {},
    ) {
        super();

        this._id = data._id;
        this.discordId = data.discordId;
        this.transferUid = data.transferUid;
        this.transferList = data.transferList ?? [];
    }
}
