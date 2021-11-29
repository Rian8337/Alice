import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Player } from "osu-droid";
import { Collection } from "discord.js";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";

export const run: EventUtil["run"] = async () => {
    setInterval(async () => {
        if (Config.maintenance || CommandUtilManager.globallyDisabledEventUtils.get("ready")?.includes("clanRankUpdating")) {
            return;
        }

        const executionTime: number = Math.floor(Date.now() / 1000);

        const clans: Collection<string, Clan> = await DatabaseManager.elainaDb.collections.clan.get("name");

        for await (const clan of clans.values()) {
            // Do not update rank if weekly upkeep is near
            if (clan.weeklyfee - executionTime <= 60 * 10) {
                continue;
            }

            for await (const member of clan.member_list.values()) {
                const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(member.id);

                if (!bindInfo) {
                    continue;
                }

                let highestRank: number = Number.POSITIVE_INFINITY;
                let highestRankUid: number = 0;

                for await (const uid of bindInfo.previous_bind) {
                    const player: Player = await Player.getInformation({ uid: uid });

                    if (!player.username) {
                        continue;
                    }

                    if (highestRank > player.rank) {
                        highestRank = player.rank;
                        highestRankUid = uid;
                    }
                }

                member.uid = highestRankUid;
                member.rank = highestRank;
            }

            await clan.updateClan();
        }
    }, 60 * 20 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for occasionally updating ranks of clan members.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"]
};