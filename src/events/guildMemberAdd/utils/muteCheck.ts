import { Collection, GuildMember, Snowflake } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Mute } from "@alice-interfaces/moderation/Mute";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            member.guild
        );

    if (!guildConfig) {
        return;
    }

    const currentMutes: Collection<Snowflake, Mute> = guildConfig.currentMutes;

    const muteInformation: Mute | undefined = currentMutes.get(member.id);

    if (!muteInformation) {
        return;
    }

    await MuteManager.continueMute(member, muteInformation);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if a user is still muted when rejoining. Useful to prevent mute circumvention.",
    togglePermissions: ["MANAGE_GUILD"],
    toggleScope: ["GLOBAL", "GUILD"],
};
