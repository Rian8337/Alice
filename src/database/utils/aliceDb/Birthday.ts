import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseBirthday } from "@alice-interfaces/database/aliceDb/DatabaseBirthday";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { ObjectId } from "bson";
import { Snowflake } from "discord.js";

export class Birthday extends Manager implements DatabaseBirthday {
    discordid: Snowflake;
    date: number;
    month: number;
    timezone: number;
    isLeapYear: boolean;
    readonly _id?: ObjectId;

    constructor(data: DatabaseBirthday = DatabaseManager.aliceDb.collections.birthday.defaultDocument) {
        super();

        this._id = data._id;
        this.discordid = data.discordid;
        this.date = data.date;
        this.month = data.month;
        this.timezone = data.timezone;
        this.isLeapYear = data.isLeapYear;
    }

    /**
     * Forcefully sets the birthday of this user.
     * 
     * @param date The new birthday date.
     * @param month The new birthday month.
     * @param timezone The new timezone of the user.
     * @returns An object containing information about the operation.
     */
    forceSetBirthday(date: number, month: number, timezone?: number): Promise<DatabaseOperationResult> {
        this.date = date;
        this.month = month;
        this.timezone = timezone ?? this.timezone;

        return DatabaseManager.aliceDb.collections.birthday.setUserBirthday(
            this.discordid,
            this.date,
            this.month,
            this.timezone,
            true
        );
    }
}