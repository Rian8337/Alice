import { Bot } from "@alice-core/Bot";
import { Config } from "@alice-core/Config";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { EventUtil } from "structures/core/EventUtil";
import { MessageAnalyticsHelper } from "@alice-utils/helpers/MessageAnalyticsHelper";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import consola from "consola";

async function resetDailyCoinsAndMapShare(): Promise<void> {
    await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
        { discordid: "386742340968120321" },
        { $inc: { dailyreset: 86400 } }
    );

    await DatabaseManager.aliceDb.collections.playerInfo.updateMany(
        {},
        {
            $set: {
                hasClaimedDaily: false,
                hasSubmittedMapShare: false,
                transferred: 0,
            },
        }
    );
}

async function kickUnverifiedMembers(client: Bot): Promise<void> {
    consola.info("Checking for unverified members to prune");

    const guild = await client.guilds.fetch(Constants.mainServer);

    const members = await guild.members.fetch({ force: true });

    const role = guild.roles.cache.find((r) => r.name === "Member")!;

    const currentDate = Date.now();

    const unverifiedMembers = members.filter(
        (v) =>
            !v.user.bot &&
            !v.roles.cache.has(role.id) &&
            currentDate - v.joinedTimestamp! >= 86400 * 7 * 1000
    );

    const totalKick = unverifiedMembers.size;

    let kickedCount = 0;

    consola.info("Kicking", totalKick, "members");

    for (const [, member] of unverifiedMembers) {
        await member.kick("Unverified prune");

        consola.info(`${++kickedCount}/${totalKick} members kicked`);
    }

    consola.info("Pruning done");
}

export const run: EventUtil["run"] = async (client) => {
    const playerInfo: PlayerInfo =
        (await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            "386742340968120321",
            {
                projection: {
                    _id: 0,
                    dailyreset: 1,
                },
            }
        ))!;

    let resetTime: number = playerInfo.dailyreset!;

    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("dailyCycle") ||
            resetTime > Math.floor(Date.now() / 1000)
        ) {
            return;
        }

        resetTime += 86400;

        resetDailyCoinsAndMapShare();
        MessageAnalyticsHelper.fetchDaily((resetTime - 86400) * 1000);
        kickUnverifiedMembers(client);
    }, 15 * 1000);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for doing daily activities such as message analytics fetch and coins claim reset.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
