import { GuildBasedChannel, GuildMember } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const general: GuildBasedChannel | null = await member.guild.channels.fetch(
        Constants.mainServer
    );

    if (general?.isTextBased()) {
        general.send({
            content: `Welcome ${
                (await DatabaseManager.elainaDb.collections.userBind.isUserBinded(
                    member.id
                ))
                    ? "back "
                    : ""
            }to ${member.guild.name}, ${member}!`,
            files: [Constants.welcomeImageLink],
        });
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for greeting new users to the server.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
