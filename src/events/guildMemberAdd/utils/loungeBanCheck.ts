import { GuildMember } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { LoungeLock } from "@alice-database/utils/aliceDb/LoungeLock";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const lockInfo: LoungeLock | null =
        await DatabaseManager.aliceDb.collections.loungeLock.getUserLockInfo(
            member.id
        );

    if (!lockInfo || lockInfo.isExpired) {
        return;
    }

    LoungeLockManager.insertLockPermissionToChannel(member.id);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for readding lounge locks to users who rejoined the main server.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
