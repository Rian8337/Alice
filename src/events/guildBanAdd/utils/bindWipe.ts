import { Guild, GuildChannel, TextChannel, User } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildPunishmentConfig } from "@alice-database/utils/aliceDb/GuildPunishmentConfig";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";

export const run: EventUtil["run"] = async (_, guild: Guild, user: User) => {
    if (guild.id !== Constants.mainServer) {
        return;
    }

    const guildConfig: GuildPunishmentConfig | null = await DatabaseManager.aliceDb.collections.guildPunishmentConfig.getGuildConfig(guild.id);

    if (!guildConfig) {
        return;
    }

    const logChannel: GuildChannel | null = guildConfig.getGuildLogChannel(guild);

    if (!(logChannel instanceof TextChannel)) {
        return;
    }

    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(user);

    if (!bindInfo) {
        return;
    }

    await DatabaseManager.elainaDb.collections.userBind.delete({ discordid: user.id });

    await DatabaseManager.aliceDb.collections.rankedScore.delete({ uid: { $in: bindInfo.previous_bind } });

    logChannel.send(MessageCreator.createAccept(
        "Successfully wiped user's droid pp and ranked score data!"
    ));
};

export const config: EventUtil["config"] = {
    description: "Responsible for wiping a user's droid pp and ranked score data once a user is banned.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};