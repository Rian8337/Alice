import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OnboardingAccountBindLocalization } from "@alice-localization/interactions/modals/Onboarding/OnboardingAccountBindLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { OperationResult } from "@alice-structures/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization: OnboardingAccountBindLocalization =
        new OnboardingAccountBindLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const email: string = interaction.fields.getTextInputValue("email");
    const username: string = interaction.fields.getTextInputValue("username");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const player: Player | null = await Player.getInformation(username);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    const uidBindInfo: UserBind | null = await dbManager.getFromUid(
        player.uid,
        { projection: { _id: 0 } }
    );

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBindedError")
            ),
        });
    }

    const userBindInfo: UserBind | null = await dbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                previous_bind: 1,
            },
        }
    );

    if (userBindInfo) {
        const isUidBinded: boolean = userBindInfo.isUidBinded(player.uid);

        if (!isUidBinded) {
            if (email !== player.email) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("incorrectEmail")
                    ),
                });
            }

            const confirmation: boolean =
                await MessageButtonCreator.createConfirmation(
                    interaction,
                    {
                        content: MessageCreator.createWarn(
                            localization.getTranslation(
                                "newAccountBindConfirmation"
                            ),
                            username
                        ),
                    },
                    [interaction.user.id],
                    10,
                    localization.language
                );

            if (!confirmation) {
                return;
            }
        }

        const result: OperationResult = await userBindInfo.bind(
            player,
            localization.language
        );

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountBindError"),
                    player.username,
                    result.reason!
                ),
            });
        }

        if (isUidBinded) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("oldAccountBindSuccessful"),
                    player.username
                ),
            });
        } else {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("newAccountBindSuccessful"),
                    player.username,
                    (1 - userBindInfo.previous_bind.length).toString()
                ),
            });
        }
    } else {
        if (email !== player.email) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("incorrectEmail")
                ),
            });
        }

        const result: OperationResult = await dbManager.insert({
            discordid: interaction.user.id,
            uid: player.uid,
            username: player.username,
            previous_bind: [player.uid],
        });

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountBindError"),
                    result.reason!
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountBindSuccessful"),
                player.username,
                "1"
            ),
        });
    }
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
