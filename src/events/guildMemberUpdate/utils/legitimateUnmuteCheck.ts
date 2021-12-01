import { Collection, GuildMember, Role, Snowflake } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Mute } from "@alice-interfaces/moderation/Mute";
import { MuteManager } from "@alice-utils/managers/MuteManager";
import { DateTimeFormatHelper } from "@alice-utils/helpers/DateTimeFormatHelper";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (
    _,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    const muteRole: Role | undefined = MuteManager.getGuildMuteRole(
        newMember.guild
    );

    if (!muteRole) {
        return;
    }

    if (
        !oldMember.roles.cache.find((r) => r.equals(muteRole)) ||
        newMember.roles.cache.find((r) => r.equals(muteRole))
    ) {
        return;
    }

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            newMember.guild
        );

    if (!guildConfig) {
        return;
    }

    const currentMutes: Collection<Snowflake, Mute> = guildConfig.currentMutes;

    const muteInformation: Mute | undefined = currentMutes.get(newMember.id);

    if (!muteInformation) {
        return;
    }

    if (
        DateTimeFormatHelper.getTimeDifference(muteInformation.muteEndTime) > 0
    ) {
        newMember.roles.add(
            muteRole,
            "Mute time isn't over, please use /unmute to unmute the user!"
        );
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if a user is unmuted before their mute time is over, possibly caused by someone removing the mute role manually.",
    togglePermissions: ["MANAGE_GUILD"],
    toggleScope: ["GLOBAL", "GUILD"],
};
