import {
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    User,
} from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { LoungeLockManager } from "@alice-utils/managers/LoungeLockManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    if (guildBan.guild.id !== Constants.mainServer) {
        return;
    }

    const auditLogEntries: GuildAuditLogs<"MEMBER_BAN_ADD"> =
        await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: "MEMBER_BAN_ADD",
        });

    const banLog:
        | GuildAuditLogsEntry<
              "MEMBER_BAN_ADD",
              "MEMBER_BAN_ADD",
              "DELETE",
              "USER"
          >
        | undefined = auditLogEntries.entries.first();

    if (!banLog) {
        return;
    }

    const target: User = banLog.target!;

    if (target.id !== guildBan.user.id) {
        return;
    }

    await LoungeLockManager.lock(
        target.id,
        "Banned from server",
        Number.POSITIVE_INFINITY
    );
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for locking users from lounge if they are banned from the main server.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
