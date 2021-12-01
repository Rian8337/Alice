import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { GuildMember, Role, TextChannel } from "discord.js";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            member.id
        );

    if (bindInfo) {
        const role: Role = member.guild.roles.cache.find(
            (r) => r.name === "Member"
        )!;

        await member.roles.add(
            role,
            "User is binded; automating verification process"
        );

        const general: TextChannel = <TextChannel>(
            member.guild.channels.cache.get(Constants.mainServer)
        );

        general.send({
            content: `Welcome back to ${member.guild.name}, ${member}!`,
            files: [Constants.welcomeImageLink],
        });
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for instantly verifying binded users.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
