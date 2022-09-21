import { GuildBan, GuildBasedChannel } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "structures/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";

export const run: EventUtil["run"] = async (_, guildBan: GuildBan) => {
    if (guildBan.guild.id !== Constants.mainServer) {
        return;
    }

    const guildConfig: GuildPunishmentConfig | null =
        await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(
            guildBan.guild
        );

    if (!guildConfig) {
        return;
    }

    const logChannel: GuildBasedChannel | null =
        await guildConfig.getGuildLogChannel(guildBan.guild);

    if (!logChannel?.isTextBased()) {
        return;
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            guildBan.user,
            {
                projection: {
                    _id: 0,
                },
            }
        );

    if (!bindInfo) {
        return;
    }

    await DatabaseManager.elainaDb.collections.userBind.deleteOne({
        discordid: guildBan.user.id,
    });

    await DatabaseManager.aliceDb.collections.playerOldPPProfile.deleteOne({
        discordId: guildBan.user.id,
    });

    logChannel.send(
        MessageCreator.createAccept(`Successfully unbinded ${guildBan.user}.`)
    );
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for wiping a user's droid pp and ranked score data once a user is banned.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
