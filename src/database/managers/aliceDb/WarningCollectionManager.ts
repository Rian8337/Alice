import { Warning } from "@alice-database/utils/aliceDb/Warning";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseWarning } from "@alice-interfaces/database/aliceDb/DatabaseWarning";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { Collection as DiscordCollection, Snowflake } from "discord.js";
import { DatabaseCollectionManager } from "../DatabaseCollectionManager";

/**
 * A manager for the `userwarning` collection.
 */
export class WarningCollectionManager extends DatabaseCollectionManager<
    DatabaseWarning,
    Warning
> {
    protected override readonly utilityInstance: new (
        data: DatabaseWarning
    ) => Warning = Warning;

    override get defaultDocument(): DatabaseWarning {
        const currentDate: number = Math.floor(Date.now() / 1000);

        return {
            globalId: "",
            discordId: "",
            guildId: "",
            channelId: "",
            issuerId: "",
            creationDate: currentDate,
            expirationDate: currentDate,
            points: 0,
            reason: "",
        };
    }

    /**
     * Gets a global warning ID for a new warning.
     *
     * @param guildId The ID of the guild the warning is issued in.
     * @returns The global ID for the new warning.
     */
    async getNewGlobalWarningId(guildId: Snowflake): Promise<string> {
        return `${guildId}-${await this.getNewGuildSpecificWarningId(guildId)}`;
    }

    /**
     * Gets a guild-specific warning ID for a new warning.
     *
     * @param guildId The ID of the guild the warning is issued in.
     * @returns The guild-specific ID of the new warning.
     */
    async getNewGuildSpecificWarningId(guildId: Snowflake): Promise<number> {
        return (await this.collection.countDocuments({ guildId: guildId })) + 1;
    }

    /**
     * Gets a warning in a guild by its ID.
     *
     * @param guildId The ID of the guild.
     * @param warningId The ID of the warning.
     * @returns The warning, `null` if not found.
     */
    getByGuildWarningId(
        guildId: Snowflake,
        warningId: number
    ): Promise<Warning | null> {
        return this.getOne({ globalId: `${guildId}-${warningId}` });
    }

    /**
     * Gets a user's warnings in a guild.
     *
     * @param guildId The ID of the guild.
     * @param userId The ID of the user.
     * @returns The user's warnings in the guild, mapped by the warning ID.
     */
    async getUserWarningsInGuild(
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<DiscordCollection<string, Warning>> {
        const res: DatabaseWarning[] = await this.collection
            .find({
                $and: [{ guildId: guildId }, { discordId: userId }],
            })
            .sort({ creationDate: -1 })
            .toArray();

        return ArrayHelper.arrayToCollection(
            res.map((v) => new Warning(v)),
            "globalId"
        );
    }

    /**
     * Transfer all warnings from one user to another in a guild.
     *
     * @param guildId The ID of the guild.
     * @param fromUserId The ID of the user to transfer from.
     * @param toUserId The ID of the user to transfer to.
     * @returns An object containing information about the operation.
     */
    transferWarnings(
        guildId: Snowflake,
        fromUserId: Snowflake,
        toUserId: Snowflake
    ): Promise<OperationResult> {
        return this.update(
            {
                $and: [{ guildId: guildId }, { discordId: fromUserId }],
            },
            {
                $set: {
                    discordId: toUserId,
                },
            }
        );
    }
}
