import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Collection, Guild, GuildMember } from "discord.js";

export const run: EventUtil["run"] = async (client) => {
    setInterval(async () => {
        if (Config.maintenance || CommandUtilManager.globallyDisabledEventUtils.get("ready")?.includes("unverifiedPrune")) {
            return;
        }

        const guild: Guild = await client.guilds.fetch(Constants.mainServer);

        const guildMembers: Collection<string, GuildMember> | void = await guild.members.fetch().catch(() => {});

        if (!guildMembers) {
            return;
        }

        const unverifiedMembers: Collection<string, GuildMember> = guildMembers.filter(v =>
            !v.user.bot && !v.roles.cache.some(v => v.name === "Member") && v.roles.cache.size === 0
        );

        for await (const member of unverifiedMembers.values()) {
            if (member.joinedAt === null || member.joinedTimestamp === null || member.joinedTimestamp <= 86400 * 7 * 1000) {
                continue;
            }

            await member.kick(`Unverified prune (user joined at ${member.joinedAt.toUTCString()})`);
        }
    }, 60 * 30 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for pruning unverified members that are not verified for a long time.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};