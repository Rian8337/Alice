import { DatabaseCollectionManager } from "@alice-database/managers/DatabaseCollectionManager";
import { Birthday } from "@alice-database/utils/aliceDb/Birthday";
import { DatabaseBirthday } from "@alice-interfaces/database/aliceDb/DatabaseBirthday";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { Snowflake } from "discord.js";
import { Collection as MongoDBCollection } from "mongodb";
import { BirthdayCollectionManagerLocalization } from "@alice-localization/database/managers/aliceDb/BirthdayCollectionManager/BirthdayCollectionManagerLocalization";
import { Language } from "@alice-localization/base/Language";

/**
 * A manager for the `birthday` collection.
 */
export class BirthdayCollectionManager extends DatabaseCollectionManager<
    DatabaseBirthday,
    Birthday
> {
    protected override readonly utilityInstance: DatabaseUtilityConstructor<
        DatabaseBirthday,
        Birthday
    >;

    override get defaultDocument(): DatabaseBirthday {
        const date: Date = new Date();

        return {
            discordid: "",
            date: date.getUTCDate(),
            month: date.getUTCMonth(),
            timezone: 0,
            isLeapYear: false,
        };
    }

    constructor(collection: MongoDBCollection<DatabaseBirthday>) {
        super(collection);

        this.utilityInstance = <
            DatabaseUtilityConstructor<DatabaseBirthday, Birthday>
        >new Birthday().constructor;
    }

    /**
     * Gets a user's birthday data.
     *
     * @param userId The ID of the user.
     */
    getUserBirthday(userId: Snowflake): Promise<Birthday | null> {
        return this.getOne({ discordid: userId });
    }

    /**
     * Sets a user's birthday.
     *
     * @param userId The ID of the user.
     * @param date The birthday date, ranging from 1 to the month's maximum date.
     * @param month The birthday month, ranging from 0 to 11.
     * @param timezone The timezone of the user, ranging from -12 to 14.
     * @param force Whether to forcefully set the user's birthday.
     * @returns An object containing information about the operation.
     */
    async setUserBirthday(
        userId: Snowflake,
        date: number,
        month: number,
        timezone: number,
        language: Language = "en",
        force?: boolean
    ): Promise<OperationResult> {
        const localization: BirthdayCollectionManagerLocalization =
            this.getLocalization(language);

        if ((await this.hasSet(userId)) && !force) {
            return this.createOperationResult(
                false,
                localization.getTranslation("birthdayIsSet")
            );
        }

        let maxDate: number = 30;

        if (
            (month % 2 === 0 && month < 7) ||
            month === 7 ||
            (month % 2 !== 0 && month > 7)
        ) {
            maxDate = 31;
        } else if (month === 1) {
            // Special case for February
            maxDate = 29;
        }

        if (!NumberHelper.isNumberInRange(date, 1, maxDate, true)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("invalidDate")
            );
        }

        if (!NumberHelper.isNumberInRange(month, 0, 11, true)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("invalidMonth")
            );
        }

        if (!NumberHelper.isNumberInRange(timezone, -12, 14, true)) {
            return this.createOperationResult(
                false,
                localization.getTranslation("invalidTimezone")
            );
        }

        // Detect if date entry is 29 Feb
        const isLeapYear = month === 1 && date === 29;
        if (isLeapYear) {
            month = 2;
            date = 1;
        }

        await this.collection.updateOne(
            { discordid: userId },
            {
                $set: {
                    date: date,
                    month: month,
                    timezone: timezone,
                    isLeapYear: isLeapYear,
                },
            },
            { upsert: true }
        );

        return this.createOperationResult(true);
    }

    /**
     * Checks if a Discord user has set their birthday.
     *
     * @param userId The ID of the user.
     * @returns Whether the user has set their birthday.
     */
    async hasSet(userId: Snowflake): Promise<boolean> {
        return !!(await this.collection.findOne({ discordid: userId }));
    }

    /**
     * Gets the localization of this database manager.
     *
     * @param language The language to localize.
     */
    private getLocalization(
        language: Language
    ): BirthdayCollectionManagerLocalization {
        return new BirthdayCollectionManagerLocalization(language);
    }
}
