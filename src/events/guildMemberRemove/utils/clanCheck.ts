import { GuildMember } from "discord.js";
import { EventUtil } from "structures/core/EventUtil";
import { Clan } from "@database/utils/elainaDb/Clan";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { Language } from "@localization/base/Language";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ClanCheckLocalization } from "@localization/events/guildMemberRemove/clanCheck/ClanCheckLocalization";
import { StringHelper } from "@utils/helpers/StringHelper";

export const run: EventUtil["run"] = async (_, member: GuildMember) => {
    if (member.guild.id !== Constants.mainServer) {
        return;
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(member.id);

    if (!clan) {
        return;
    }

    if (clan.member_list.get(member.id)) {
        const language: Language = CommandHelper.getUserPreferredLocale(
            member.id,
        );
        await clan.removeMember(member.id, language, true);
        if (clan.exists) {
            const localization: ClanCheckLocalization =
                new ClanCheckLocalization(language);
            await clan.notifyLeader(
                StringHelper.formatString(
                    localization.getTranslation("memberKicked"),
                    member.toString(),
                ),
            );
            await clan.updateClan();
        }
    }
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for checking if the user who left the main server is a member of a clan and kicks the user from the clan.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
