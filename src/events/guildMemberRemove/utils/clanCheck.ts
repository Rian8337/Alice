import { GuildMember } from "discord.js";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromUser(member.id);

    if (!clan) {
        return;
    }

    if (clan.member_list.get(member.id)) {
        await clan.removeMember(member.id, true);
        if (clan.exists) {
            await clan.notifyLeader(`Hey, your member (${member}) has left the server, therefore they have been kicked from your clan!`);
            await clan.updateClan();
        }
    }
};

export const config: EventUtil["config"] = {
    description: "Responsible for checking if the user who left the main server is a member of a clan and kicks the user from the clan.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};