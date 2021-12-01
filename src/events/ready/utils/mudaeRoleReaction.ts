import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { RoleReactionCreator } from "@alice-utils/creators/RoleReactionCreator";
import { Guild, TextChannel, Role, Message } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    const guild: Guild = await client.guilds.fetch("635532651029332000");

    const channel: TextChannel = <TextChannel>(
        await guild.channels.fetch("640165306404438026")
    );

    const role: Role = (await guild.roles.fetch("674918022116278282"))!;

    const message: Message = await channel.messages.fetch("657597328772956160");

    RoleReactionCreator.createReactionBasedRoleAssignment(
        guild,
        message,
        role,
        "639481086425956382"
    );
};

export const config: EventUtil["config"] = {
    description: "Responsible for Mudae role reaction.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
