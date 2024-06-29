import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Language } from "@alice-localization/base/Language";
import {
    RecalculationManagerLocalization,
    RecalculationManagerStrings,
} from "@alice-localization/utils/managers/RecalculationManager/RecalculationManagerLocalization";
import { RecalculationQueue } from "@alice-structures/dpp/PrototypeRecalculationQueue";
import { Manager } from "@alice-utils/base/Manager";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import {
    Collection,
    Snowflake,
    CommandInteraction,
    userMention,
} from "discord.js";

/**
 * A manager for dpp recalculations.
 */
export abstract class RecalculationManager extends Manager {
    /**
     * Recalculation queue for per-user recalculation, mapped by user ID.
     */
    private static readonly recalculationQueue = new Collection<
        Snowflake,
        CommandInteraction
    >();

    /**
     * Recalculation queue for per-user prototype recalculation, mapped by user ID.
     */
    private static readonly prototypeRecalculationQueue = new Collection<
        Snowflake,
        RecalculationQueue
    >();

    private static readonly calculationSuccessResponse: keyof RecalculationManagerStrings =
        "recalculationSuccessful";
    private static readonly calculationFailedResponse: keyof RecalculationManagerStrings =
        "recalculationFailed";

    private static calculationIsProgressing = false;
    private static prototypeCalculationIsProgressing = false;

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
     * @param reworkType The rework type of the prototype.
     */
    static queuePrototype(
        interaction: CommandInteraction,
        userId: Snowflake,
        reworkType: string,
    ): void {
        this.prototypeRecalculationQueue.set(userId, {
            interaction: interaction,
            reworkType: reworkType,
        });

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
            const calculatedUser = this.recalculationQueue.firstKey()!;
            const calculatedUserMention = userMention(calculatedUser);
            const interaction = this.recalculationQueue.first()!;
            const localization = this.getLocalization(
                CommandHelper.getUserPreferredLocale(interaction),
            );

            this.recalculationQueue.delete(calculatedUser);

            try {
                const bindInfo: UserBind | null =
                    await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                        calculatedUser,
                    );

                if (!bindInfo) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            calculatedUserMention,
                            localization.getTranslation("userNotBinded"),
                        ),
                    });

                    continue;
                }

                if (await bindInfo.isDPPBanned()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            calculatedUserMention,
                            localization.getTranslation("userDPPBanned"),
                        ),
                    });

                    continue;
                }

                const result = await bindInfo.recalculateAllScores();

                if (result.isSuccessful()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createAccept(
                            localization.getTranslation(
                                this.calculationSuccessResponse,
                            ),
                            interaction.user.toString(),
                            calculatedUserMention,
                        ),
                    });
                } else if (result.failed()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            calculatedUserMention,
                            result.reason,
                        ),
                    });
                }
            } catch (e) {
                await interaction.channel!.send({
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            this.calculationFailedResponse,
                        ),
                        interaction.user.toString(),
                        calculatedUserMention,
                        <string>e,
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
            const calculatedUser = this.prototypeRecalculationQueue.firstKey()!;
            const queue = this.prototypeRecalculationQueue.first()!;
            const { interaction, reworkType } = queue;
            const localization = this.getLocalization(
                CommandHelper.getUserPreferredLocale(interaction),
            );

            this.prototypeRecalculationQueue.delete(calculatedUser);

            try {
                const bindInfo =
                    await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                        calculatedUser,
                        {
                            projection: {
                                _id: 0,
                                pp: 1,
                                playc: 1,
                                pptotal: 1,
                                previous_bind: 1,
                                uid: 1,
                                username: 1,
                            },
                        },
                    );

                if (!bindInfo) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            `user ${calculatedUser}`,
                            localization.getTranslation("userNotBinded"),
                        ),
                    });

                    continue;
                }

                if (await bindInfo.isDPPBanned()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                            localization.getTranslation("userDPPBanned"),
                        ),
                    });

                    continue;
                }

                const result = await bindInfo.calculatePrototypeDPP(reworkType);

                if (result.isSuccessful()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createAccept(
                            localization.getTranslation(
                                this.calculationSuccessResponse,
                            ),
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                        ),
                    });
                } else if (result.failed()) {
                    await interaction.channel!.send({
                        content: MessageCreator.createReject(
                            localization.getTranslation(
                                this.calculationFailedResponse,
                            ),
                            interaction.user.toString(),
                            `uid ${bindInfo.uid}`,
                            result.reason,
                        ),
                    });
                }
            } catch (e) {
                await interaction.channel!.send({
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            this.calculationFailedResponse,
                        ),
                        interaction.user.toString(),
                        `user ${calculatedUser}`,
                        <string>e,
                    ),
                });
            }
        }

        this.prototypeCalculationIsProgressing = false;
    }

    /**
     * Gets the localization of this manager utility.
     *
     * @param language The language to localize.
     */
    private static getLocalization(
        language: Language,
    ): RecalculationManagerLocalization {
        return new RecalculationManagerLocalization(language);
    }
}
