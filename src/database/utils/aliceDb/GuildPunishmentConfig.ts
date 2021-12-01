import { DatabaseManager } from "@alice-database/DatabaseManager";
import { DatabaseGuildPunishmentConfig } from "@alice-interfaces/database/aliceDb/DatabaseGuildPunishmentConfig";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Mute } from "@alice-interfaces/moderation/Mute";
import { RoleMutePermission } from "@alice-interfaces/moderation/RoleMutePermission";
import { Manager } from "@alice-utils/base/Manager";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { ObjectId } from "bson";
import { Collection, Guild, GuildChannel, Snowflake } from "discord.js";

/**
 * Represents a guild's punishment configuration.
 */
export class GuildPunishmentConfig extends Manager {
    /**
     * The ID of the guild.
     */
    guildID: Snowflake;

    /**
     * The ID of the guild's log channel.
     */
    logChannel: Snowflake;

    /**
     * Configuration for roles that are allowed to use mute commands, mapped by role ID.
     */
    allowedMuteRoles: Collection<Snowflake, RoleMutePermission>;

    /**
     * Roles that cannot be muted.
     */
    immuneMuteRoles: Snowflake[];

    /**
     * Temporary mutes that are currently active in the guild, mapped by user ID.
     */
    currentMutes: Collection<Snowflake, Mute>;

    /**
     * The BSON object ID of this document in the database.
     */
    readonly _id?: ObjectId;

    constructor(
        data: DatabaseGuildPunishmentConfig = DatabaseManager.aliceDb
            ?.collections.guildPunishmentConfig.defaultDocument ?? {}
    ) {
        super();

        this._id = data._id;
        this.guildID = data.guildID;
        this.logChannel = data.logChannel;
        this.allowedMuteRoles = ArrayHelper.arrayToCollection(
            data.allowedMuteRoles ?? [],
            "id"
        );
        this.immuneMuteRoles = data.immuneMuteRoles ?? [];
        this.currentMutes = ArrayHelper.arrayToCollection(
            data.currentMutes ?? [],
            "userID"
        );
    }

    /**
     * Gets the guild's log channel.
     *
     * @param guild The guild instance.
     * @returns The guild's log channel, `null` if not found.
     */
    getGuildLogChannel(guild: Guild): GuildChannel | null {
        return <GuildChannel | null>guild.channels.resolve(this.logChannel);
    }

    /**
     * Grants mute immunity for a role.
     *
     * @param roleId The ID of the role.
     * @returns An object containing information about the operation.
     */
    async grantMuteImmunity(roleId: Snowflake): Promise<OperationResult> {
        if (this.immuneMuteRoles.find((r) => r === roleId)) {
            return this.createOperationResult(true);
        }

        this.immuneMuteRoles.push(roleId);

        return DatabaseManager.aliceDb.collections.guildPunishmentConfig.update(
            { guildID: this.guildID },
            {
                $addToSet: {
                    immuneMuteRoles: roleId,
                },
            }
        );
    }

    /**
     * Revokes mute immunity from a role.
     *
     * @param roleId The ID of the role.
     * @returns An object containing information about the operation.
     */
    async revokeMuteImmunity(roleId: Snowflake): Promise<OperationResult> {
        const index: number = this.immuneMuteRoles.findIndex(
            (r) => r === roleId
        );

        if (index === -1) {
            return this.createOperationResult(true);
        }

        this.immuneMuteRoles.splice(index, 1);

        return DatabaseManager.aliceDb.collections.guildPunishmentConfig.update(
            { guildID: this.guildID },
            {
                $pull: {
                    immuneMuteRoles: roleId,
                },
            }
        );
    }

    /**
     * Grants mute permission for a role.
     *
     * @param roleId The ID of the role.
     * @param maxTime The maximum time the role is allowed to mute for. -1 means the role can mute indefinitely.
     */
    async grantMutePermission(
        roleId: Snowflake,
        maxTime: number
    ): Promise<OperationResult> {
        const roleMutePermission: RoleMutePermission | undefined =
            this.allowedMuteRoles.get(roleId);

        if (roleMutePermission?.maxTime === maxTime) {
            return this.createOperationResult(true);
        }

        this.allowedMuteRoles.set(roleId, { id: roleId, maxTime: maxTime });

        return DatabaseManager.aliceDb.collections.guildPunishmentConfig.update(
            { guildID: this.guildID },
            {
                $set: {
                    allowedMuteRoles: [...this.allowedMuteRoles.values()],
                },
            }
        );
    }

    /**
     * Revokes mute permission from a role.
     *
     * @param roleId The ID of the role.
     * @returns An object containing information about the operation.
     */
    async revokeMutePermission(roleId: Snowflake): Promise<OperationResult> {
        if (!this.allowedMuteRoles.delete(roleId)) {
            return this.createOperationResult(true);
        }

        return DatabaseManager.aliceDb.collections.guildPunishmentConfig.update(
            { guildID: this.guildID },
            {
                $set: {
                    allowedMuteRoles: [...this.allowedMuteRoles.values()],
                },
            }
        );
    }

    // TODO: methods for managing mutes, immunity, allowing, etc.
}
