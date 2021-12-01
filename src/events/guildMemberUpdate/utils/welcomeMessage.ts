import { GuildChannel, GuildMember, ThreadChannel } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";

export const run: EventUtil["run"] = async (
    _,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    if (
        oldMember.user.bot ||
        oldMember.roles.cache.size === newMember.roles.cache.size
    ) {
        return;
    }

    const general: GuildChannel | ThreadChannel | undefined =
        newMember.guild.channels.cache.get(Constants.mainServer);

    if (!general?.isText()) {
        return;
    }

    // if (!oldMember.roles.cache.find(r => r.name === "Member") && newMember.roles.cache.find(r => r.name === "Member")) {
    //     general.send({
    //         content: `Welcome to ${newMember.guild.name}, ${newMember}!`,
    //         files: [ Constants.welcomeImageLink ]
    //     });
    // }
};

export const config: EventUtil["config"] = {
    description: "Responsible for welcoming users upon verification.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
