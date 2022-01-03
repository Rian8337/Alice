import { Collection, Guild, GuildMember, Role, Snowflake } from "discord.js";
import { GuildMemberPermissionComparison } from "@alice-types/utils/GuildMemberPermissionComparison";
import { Permission } from "@alice-types/core/Permission";
import { StringHelper } from "./StringHelper";
import { Constants } from "@alice-core/Constants";
import { Bot } from "@alice-core/Bot";
import { Config } from "@alice-core/Config";

/**
 * Helper utilities to work with Discord permissions.
 */
export abstract class PermissionHelper {
    /**
     * Gets a guild member's permission position
     * compared to another guild member.
     *
     * @param member The guild member to get the permission position from.
     * @param toCompare The guild member to compare.
     * @returns Information about the guild member's position compared to the other guild member.
     */
    static comparePosition(
        member: GuildMember,
        toCompare: GuildMember
    ): GuildMemberPermissionComparison {
        const position: number = member.roles.highest.comparePositionTo(
            toCompare.roles.highest
        );

        if (position < 0) {
            return "LOWER";
        } else if (position > 0) {
            return "HIGHER";
        } else {
            return "EQUAL";
        }
    }

    /**
     * Gets the permission string representation of
     * a list of permissions.
     *
     * @param permissions The permissions to get the string from.
     * @returns The string that represents the permission.
     */
    static getPermissionString(permissions: Permission[]): string {
        if (permissions.length === 0) {
            return "None";
        }

        const permissionsString: string[] = [];

        permissions.forEach((permission) => {
            switch (permission) {
                case "SEND_TTS_MESSAGES":
                    permissionsString.push("Send TTS Messages");
                    break;
                case "USE_VAD":
                    permissionsString.push(
                        "Use VAD (Voice Activity Detection)"
                    );
                    break;
                default:
                    permissionsString.push(
                        permission
                            .split("_")
                            .map((v) => StringHelper.capitalizeString(v, true))
                            .join(" ")
                    );
            }
        });

        return permissionsString.join(", ");
    }

    /**
     * Gets a list of staff members in the main guild.
     *
     * @param client The instance of the bot.
     */
    static async getMainGuildStaffMembers(
        client: Bot
    ): Promise<Collection<Snowflake, GuildMember>> {
        const guild: Guild = await client.guilds.fetch(Constants.mainServer);

        let collection: Collection<Snowflake, GuildMember> = new Collection();

        for (const botOwner of Config.botOwners) {
            const member: GuildMember = await guild.members.fetch(botOwner);

            collection.set(botOwner, member);
        }

        const roleIds: Snowflake[] = [
            "369108742077284353",
            "595667274707370024",
        ];

        for (const roleId of roleIds) {
            const role: Role | null = await guild.roles.fetch(roleId);

            if (!role) {
                continue;
            }

            collection = collection.concat(role.members);
        }

        return collection;
    }
}
