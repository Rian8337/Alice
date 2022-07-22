import { Config } from "@alice-core/Config";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { EventUtil } from "structures/core/EventUtil";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Message, TextChannel } from "discord.js";
import { OldPPEntry } from "@alice-structures/dpp/OldPPEntry";
import { OldPerformanceCalculationResult } from "@alice-utils/dpp/OldPerformanceCalculationResult";
import { BeatmapOldDifficultyHelper } from "@alice-utils/helpers/BeatmapOldDifficultyHelper";
import { DPPHelper } from "@alice-utils/helpers/DPPHelper";
import { HelperFunctions } from "@alice-utils/helpers/HelperFunctions";
import { Score } from "@rian8337/osu-droid-utilities";

export const run: EventUtil["run"] = async (client) => {
    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const uncalculatedCount: number =
        await dbManager.getRecalcUncalculatedPlayerCount();

    if (uncalculatedCount === 0) {
        return;
    }

    const channel: TextChannel = <TextChannel>(
        await client.channels.fetch("546135349533868072")
    );

    const message: Message = await channel.messages.fetch("905354500380954644");

    let calculatedCount: number =
        await dbManager.getRecalcCalculatedPlayerCount();

    const total: number = calculatedCount + uncalculatedCount;

    let player: UserBind | null;

    while ((player = await dbManager.getRecalcUnscannedPlayers(1))) {
        client.logger.info(`Now calculating ID ${player.discordid}`);

        const ppEntries: OldPPEntry[] = [];

        let i = 0;

        for (const ppEntry of player.pp.values()) {
            console.log(`${++i}/${player.pp.size} calculated`);

            const score: Score | null = await player.getScoreRelativeToPP(
                ppEntry
            );

            if (!score) {
                continue;
            }

            const calcResult: OldPerformanceCalculationResult | null =
                await BeatmapOldDifficultyHelper.calculateScorePerformance(
                    score
                );

            if (!calcResult) {
                continue;
            }

            await HelperFunctions.sleep(0.1);

            ppEntries.push(DPPHelper.scoreToOldPPEntry(score, calcResult));
        }

        const newList: Collection<string, OldPPEntry> = new Collection();

        DPPHelper.insertScore(newList, ppEntries);

        await dbManager.updateOne(
            { discordid: player.discordid },
            {
                $set: {
                    dppRecalcComplete: true,
                },
            }
        );

        await DatabaseManager.aliceDb.collections.playerOldPPProfile.updateOne(
            { discordId: player.discordid },
            {
                $set: {
                    pp: [...newList.values()],
                    pptotal: DPPHelper.calculateFinalPerformancePoints(newList),
                    playc: player.playc,
                    weightedAccuracy:
                        DPPHelper.calculateWeightedAccuracy(newList),
                },
                $setOnInsert: {
                    uid: player.uid,
                    username: player.username,
                    previous_bind: player.previous_bind,
                },
            },
            { upsert: true }
        );

        client.logger.info(`${++calculatedCount} players recalculated`);

        await message.edit({
            content: MessageCreator.createWarn(
                "Recalculating players... (%s/%s (%s%))",
                Math.min(calculatedCount, total).toLocaleString(),
                total.toLocaleString(),
                ((calculatedCount * 100) / total).toFixed(2)
            ),
        });
    }

    await dbManager.updateMany({}, { $unset: { dppRecalcComplete: "" } });

    channel.send({
        content: MessageCreator.createAccept(
            "%s, recalculation done!",
            `<@${Config.botOwners[1]}>`
        ),
    });
};

export const config: EventUtil["config"] = {
    description: "Responsible for resuming ongoing calculation.",
    togglePermissions: ["BotOwner"],
    toggleScope: ["GLOBAL"],
};
