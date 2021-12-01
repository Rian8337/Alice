import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { GuildBan } from "discord.js";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    await DatabaseManager.aliceDb.collections.guildPunishmentConfig.update(
        { guildID: guildBan.guild.id },
        { $pull: { currentMutes: { userID: guildBan.user.id } } }
    );
};

export const config: EventUtil["config"] = {
    description: "Responsible for removing mute cache of a banned person.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
