import { Symbols } from "@enums/utils/Symbols";
import { Manager } from "@utils/base/Manager";
import {
    Guild,
    GuildMember,
    Message,
    ReactionCollector,
    Role,
    Snowflake,
} from "discord.js";

/**
 * A utility to create reaction-based role assignment.
 */
export abstract class RoleReactionCreator extends Manager {
    /**
     * Creates a reaction-based role assignment.
     *
     * @param guild The guild to create the reaction-based role assignment in.
     * @param message The message to create the reaction-based role assignment on.
     * @param role The role to assign.
     * @param emoji The emoji to use in the reaction-based role assignment.
     */
    static async createReactionBasedRoleAssignment(
        guild: Guild,
        message: Message,
        role: Role,
        emoji: Symbols | Snowflake,
    ): Promise<ReactionCollector> {
        await message.react(emoji);

        const collector: ReactionCollector = message.createReactionCollector({
            filter: (reaction, user) =>
                (reaction.emoji.name === emoji ||
                    reaction.emoji.id === emoji) &&
                user.id !== this.client.user.id,
        });

        collector.on("collect", async (_, user) => {
            const guildMember: GuildMember = await guild.members.fetch(user);

            if (guildMember.roles.cache.has(role.id)) {
                guildMember.roles.remove(role, "Automatic role assignment");
            } else {
                guildMember.roles.add(role, "Automatic role assignment");
            }

            message.reactions.cache.forEach((reaction) =>
                reaction.users.remove(user.id),
            );
        });

        return collector;
    }
}
