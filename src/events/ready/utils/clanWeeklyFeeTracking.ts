import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { Collection, Guild, GuildMember, Role, Snowflake } from "discord.js";
import { Player } from "@rian8337/osu-droid-utilities";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: EventUtil["run"] = async (client) => {
    const interval: NodeJS.Timeout = setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("clanWeeklyFeeUpdating")
        ) {
            return;
        }

        const guild: Guild = await client.guilds.fetch(Constants.mainServer);
        const globalClanRole: Role | undefined = guild.roles.cache.find(
            (r) => r.name === "Clans"
        );

        if (!globalClanRole) {
            clearInterval(interval);
            return;
        }

        const executionTime: number = Math.floor(Date.now() / 1000);

        const clans: Collection<string, Clan> =
            await DatabaseManager.elainaDb.collections.clan.getClansDueToWeeklyFee(
                executionTime
            );

        let kickedCount: number = 0;

        for (const clan of clans.values()) {
            const upkeepDistribution: number[] =
                clan.getEqualUpkeepDistribution();

            for (const member of clan.member_list.values()) {
                if (!clan.exists) {
                    break;
                }

                const guildMember: GuildMember | null = await guild.members
                    .fetch(member.id)
                    .catch(() => null);

                const language: Language = await CommandHelper.getUserPreferredLocale(member.id);

                // If the person is not in the server, kick the person
                if (!guildMember) {
                    upkeepDistribution.shift();
                    await clan.removeMember(member.id, language);
                    ++kickedCount;
                    continue;
                }

                const bindInfo: UserBind | null =
                    await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                        member.id
                    );

                if (!bindInfo) {
                    upkeepDistribution.shift();
                    await clan.removeMember(member.id, language);
                    ++kickedCount;
                    continue;
                }

                let highestRank: number = Number.POSITIVE_INFINITY;

                for (const uid of bindInfo.previous_bind) {
                    const player: Player = await Player.getInformation({
                        uid: uid,
                    });

                    if (!player.username) {
                        continue;
                    }

                    highestRank = Math.min(player.rank, highestRank);
                }

                const randomUpkeepDistribution: number =
                    ArrayHelper.getRandomArrayElement(upkeepDistribution);

                const upkeep: number =
                    clan.calculateUpkeep(member.id) + randomUpkeepDistribution;

                upkeepDistribution.splice(
                    upkeepDistribution.indexOf(randomUpkeepDistribution),
                    1
                );

                const memberPlayerInfo: PlayerInfo | null =
                    await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
                        member.id
                    );

                if (!memberPlayerInfo) {
                    // Clan member doesn't have any Alice coins info, possibly being banned from the server or the game.
                    // In that case, simply kick.
                    await clan.removeMember(member.id, language);
                    ++kickedCount;
                    continue;
                }

                const coins: number = memberPlayerInfo.alicecoins;

                if (coins < upkeep) {
                    // Clan member doesn't have enough Alice coins to pay upkeep.
                    // If the penalized member is the leader, kick a random member.
                    let userToKick: Snowflake = member.id;
                    let kickedGuildMember: GuildMember | undefined =
                        await guild.members.fetch(userToKick).catch(() => {
                            return undefined;
                        });

                    while (
                        clan.leader === userToKick &&
                        clan.member_list.size > 1
                    ) {
                        userToKick = clan.member_list.random()!.id;
                        kickedGuildMember = await guild.members
                            .fetch(userToKick)
                            .catch(() => {
                                return undefined;
                            });

                        if (!kickedGuildMember) {
                            userToKick = clan.leader;
                        }
                    }

                    if (clan.member_list.size === 1) {
                        // Clan only exists of the leader. Deduct clan power to the point where the clan will be disbanded.
                        const result: OperationResult =
                            clan.incrementPower(-100);

                        if (!result.success) {
                            await clan.disband();
                            await clan.notifyLeader(
                                "Hey, your clan has been disbanded as your clan power has reached less than 0."
                            );
                            continue;
                        }
                    }

                    await clan.removeMember(userToKick, await CommandHelper.getLocale(userToKick));
                    ++kickedCount;
                    continue;
                }

                // Pay for upkeep
                await memberPlayerInfo.incrementCoins(-upkeep, language);
            }

            if (!clan.exists) {
                continue;
            }

            clan.weeklyfee += 86400 * 7;

            await clan.updateClan();
            await clan.notifyLeader(
                `Hey, your clan upkeep has been picked up from your members! ${clan.member_list.size
                } member(s) have successfully paid their upkeep. A total of ${kickedCount} member(s) were kicked. Your next clan upkeep will be picked in ${new Date(
                    clan.weeklyfee * 1000
                ).toUTCString()}.`
            );
        }
    }, 60 * 10 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking clans' weekly upkeep.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
