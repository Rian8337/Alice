import { Config } from "@core/Config";
import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { EventUtil } from "structures/core/EventUtil";
import { MessageAnalyticsHelper } from "@utils/helpers/MessageAnalyticsHelper";
import { CommandUtilManager } from "@utils/managers/CommandUtilManager";

async function resetDailyCoinsAndMapShare(): Promise<void> {
    await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
        { discordid: "386742340968120321" },
        { $inc: { dailyreset: 86400 } },
    );

    await DatabaseManager.aliceDb.collections.playerInfo.updateMany(
        {},
        {
            $set: {
                hasClaimedDaily: false,
                hasSubmittedMapShare: false,
                transferred: 0,
            },
        },
    );
}

export const run: EventUtil["run"] = async () => {
    const playerInfo: PlayerInfo =
        (await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            "386742340968120321",
            {
                projection: {
                    _id: 0,
                    dailyreset: 1,
                },
            },
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
        DatabaseManager.elainaDb.collections.userBind.updateRoleConnectionMetadata();
    }, 15 * 1000);
};

export const config: EventUtil["config"] = {
    description:
        "Responsible for doing daily activities such as message analytics fetch and coins claim reset.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
