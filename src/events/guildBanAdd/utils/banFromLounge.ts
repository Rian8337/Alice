import {
    AuditLogEvent,
    GuildAuditLogs,
    GuildAuditLogsEntry,
    GuildBan,
    User,
} from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@core/Constants";
import { LoungeLockManager } from "@utils/managers/LoungeLockManager";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    if (guildBan.guild.id !== Constants.mainServer) {
        return;
    }

    const auditLogEntries: GuildAuditLogs<AuditLogEvent.MemberBanAdd> =
        await guildBan.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd,
        });

    const banLog:
        | GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd, "Delete", "User">
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
        Number.POSITIVE_INFINITY,
    );
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for locking users from lounge if they are banned from the main server.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
