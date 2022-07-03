import { DatabaseManager } from "@alice-database/DatabaseManager";
import { EventUtil } from "@alice-interfaces/core/EventUtil";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, TextChannel, User } from "discord.js";
import { ChallengeCollectionManager } from "@alice-database/managers/aliceDb/ChallengeCollectionManager";
import { CommandUtilManager } from "@alice-utils/managers/CommandUtilManager";
import { Config } from "@alice-core/Config";
import { OperationResult } from "@alice-interfaces/core/OperationResult";

export const run: EventUtil["run"] = async (client) => {
    if (!Config.isDebug) {
        return;
    }

    const notificationChannel: TextChannel = <TextChannel>(
        await client.channels.fetch("669221772083724318")
    );
    const botOwner: User = await client.users.fetch("386742340968120321");

    const dbManager: ChallengeCollectionManager =
        DatabaseManager.aliceDb.collections.challenge;

    setInterval(async () => {
        if (
            Config.maintenance ||
            CommandUtilManager.globallyDisabledEventUtils
                .get("ready")
                ?.includes("challengeTracking")
        ) {
            return;
        }

        const ongoingChallenges: Collection<string, Challenge> =
            await dbManager.get("challengeid", { status: "ongoing" });

        if (!ongoingChallenges.some((v) => v.challengeid.startsWith("d"))) {
            await botOwner
                .send("Hey dear, I need you to start a daily challenge now!")
                .catch(client.logger.error);
        }

        if (!ongoingChallenges.some((v) => v.challengeid.startsWith("w"))) {
            await botOwner
                .send("Hey dear, I need you to start a weekly challenge now!")
                .catch(client.logger.error);
        }

        for (const ongoingChallenge of ongoingChallenges.values()) {
            // End current challenge if sufficient
            const endOperationResult: OperationResult =
                await ongoingChallenge.end();

            if (!endOperationResult.success) {
                continue;
            }

            // Run the next challenge
            const nextChallengeID: string =
                (ongoingChallenge.isWeekly ? "w" : "d") +
                (parseInt(ongoingChallenge.challengeid.slice(1)) + 1);

            const nextChallenge: Challenge | null =
                await DatabaseManager.aliceDb.collections.challenge.getById(
                    nextChallengeID
                );

            if (!nextChallenge) {
                await notificationChannel.send(
                    MessageCreator.createWarn(
                        `No challenge found with ID \`${nextChallengeID}\`.`
                    )
                );
                continue;
            }

            await nextChallenge.start();
        }
    }, 60 * 10 * 1000);
};

export const config: EventUtil["config"] = {
    description: "Responsible for tracking daily and weekly challenges.",
    togglePermissions: ["BOT_OWNER"],
    toggleScope: ["GLOBAL"],
};
