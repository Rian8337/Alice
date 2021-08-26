import { GuildMember, TextChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    const lockInfo: LoungeLock | null = await DatabaseManager.aliceDb.collections.loungeLock.getUserLockInfo(member.id);

    if (!lockInfo) {
        return;
    }

    const loungeChannel: TextChannel | undefined = <TextChannel | undefined> member.guild.channels.cache.get(Constants.loungeChannel);

    if (!loungeChannel) {
        return;
    }

    loungeChannel.permissionOverwrites.edit(member, { "VIEW_CHANNEL": false }, { reason: "Lounge ban" });
};

export const config: EventUtil["config"] = {
    description: "Responsible for readding lounge locks to users who rejoined the main server.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};