import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Manager } from "@alice-utils/base/Manager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Snowflake, CommandInteraction } from "discord.js";

/**
 * A manager for dpp recalculations.
 */
export abstract class RecalculationManager extends Manager {
    /**
     * Recalculation queue for per-user recalculation, mapped by user ID.
     */
    private static readonly recalculationQueue: Collection<
        Snowflake,
        CommandInteraction
    > = new Collection();

    /**
     * Recalculation queue for per-user prototype recalculation, mapped by user ID.
     */
    private static readonly prototypeRecalculationQueue: Collection<
        Snowflake,
        CommandInteraction
    > = new Collection();

    private static readonly calculationSuccessResponse: string =
        "%s, successfully recalculated %s.";
    private static readonly calculationFailedResponse: string =
        "%s, recalculation for %s failed: %s.";

    private static calculationIsProgressing: boolean = false;
    private static prototypeCalculationIsProgressing: boolean = false;

    /**
     * Queues a user for recalculation.
     *
     * @param interaction The interaction that queued the user.
     * @param userId The ID of the queued user.
     */
    static queue(interaction: CommandInteraction, userId: Snowflake): void {
        this.recalculationQueue.set(userId, interaction);

        this.beginRecalculation();
    }

    /**
     * Queues a user for prototype recalculation.
     *
     * @param interaction The interaction that queued the user.
     * @param userId The ID of the queued user.
     */
    static queuePrototype(
        interaction: CommandInteraction,
        userId: Snowflake
    ): void {
        this.prototypeRecalculationQueue.set(userId, interaction);

        this.beginPrototypeRecalculation();
    }

    /**
     * Begins a recalculation if one has not been started yet.
     */
    private static async beginRecalculation(): Promise<void> {
        if (this.calculationIsProgressing) {
            return;
        }

        this.calculationIsProgressing = true;

        while (this.recalculationQueue.size > 0) {
            const calculatedUser: Snowflake =
                this.recalculationQueue.firstKey()!;
            const calculatedUserMention: string = `<@${calculatedUser}>`;
            const interaction: CommandInteraction =
                this.recalculationQueue.first()!;

            this.recalculationQueue.delete(calculatedUser);

            try {
                const bindInfo: UserBind | null =
                    await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                        calculatedUser
                    );

                if (!bindInfo) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            calculatedUserMention,
                            "user is not binded"
                        ),
                    });

                    continue;
                }

                if (await bindInfo.isDPPBanned()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            calculatedUserMention,
                            "user was DPP banned"
                        ),
                    });

                    continue;
                }

                const result: OperationResult =
                    await bindInfo.recalculateAllScores();

                if (result.success) {
                    await interaction.channel!.send({
                        content: MessageCreator.createAccept(
                            this.calculationSuccessResponse,
                            interaction.user.toString(),
                            calculatedUserMention
                        ),
                    });
                } else {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            calculatedUserMention,
                            result.reason!
                        ),
                    });
                }
            } catch (e) {
                await interaction.channel!.send({
                    content: MessageCreator.createReject(
                        this.calculationFailedResponse,
                        interaction.user.toString(),
                        calculatedUserMention,
                        <string>e
                    ),
                });
            }
        }

        this.calculationIsProgressing = false;
    }

    /**
     * Begins a prototype recalculation if one has not been started yet.
     */
    private static async beginPrototypeRecalculation(): Promise<void> {
        if (this.prototypeCalculationIsProgressing) {
            return;
        }

        this.prototypeCalculationIsProgressing = true;

        while (this.prototypeRecalculationQueue.size > 0) {
            const calculatedUser: Snowflake =
                this.prototypeRecalculationQueue.firstKey()!;
            const interaction: CommandInteraction =
                this.prototypeRecalculationQueue.first()!;

            this.prototypeRecalculationQueue.delete(calculatedUser);

            try {
                const bindInfo: UserBind | null =
                    await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                        calculatedUser
                    );

                if (!bindInfo) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            `user ${calculatedUser}`,
                            "user is not binded"
                        ),
                    });

                    continue;
                }

                if (bindInfo.hasAskedForRecalc) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                            "user has asked for recalculation"
                        ),
                    });

                    continue;
                }

                if (await bindInfo.isDPPBanned()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                            "user was DPP banned"
                        ),
                    });

                    continue;
                }

                const result: OperationResult =
                    await bindInfo.calculatePrototypeDPP();

                if (result.success) {
                    await interaction.channel!.send({
                        content: MessageCreator.createAccept(
                            this.calculationSuccessResponse,
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`
                        ),
                    });
                } else {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            this.calculationFailedResponse,
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                            result.reason!
                        ),
                    });
                }
            } catch (e) {
                await interaction.channel!.send({
                    content: MessageCreator.createReject(
                        this.calculationFailedResponse,
                        interaction.user.toString(),
                        `user ${calculatedUser}`,
                        <string>e
                    ),
                });
            }
        }

        this.prototypeCalculationIsProgressing = false;
    }
}
