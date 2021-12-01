import { Constants } from "@alice-core/Constants";
import { Symbols } from "@alice-enums/utils/Symbols";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { RoleReactionCreator } from "@alice-utils/creators/RoleReactionCreator";
import { Guild, Message, Role, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const channel: TextChannel = <TextChannel>(
        await guild.channels.fetch("669221772083724318")
    );

    const role: Role = (await guild.roles.fetch("674918022116278282"))!;

    const message: Message = await channel.messages.fetch("674626850164703232");

    RoleReactionCreator.createReactionBasedRoleAssignment(
        guild,
        message,
        role,
        Symbols.checkmark
    );
};

export const config: EventUtil["config"] = {
    description: "Responsible for assigning challenge watcher roles.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
