import { DatabaseManager } from "@alice-database/DatabaseManager";
import { OnboardingAccountBindLocalization } from "@alice-localization/interactions/modals/Onboarding/OnboardingAccountBindLocalization";
import { ModalCommand } from "@alice-structures/core/ModalCommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: ModalCommand["run"] = async (_, interaction) => {
    const localization = new OnboardingAccountBindLocalization(
        CommandHelper.getLocale(interaction),
    );

    const email = interaction.fields.getTextInputValue("email");
    const username = interaction.fields.getTextInputValue("username");
    const dbManager = DatabaseManager.elainaDb.collections.userBind;

    if (!StringHelper.isUsernameValid(username)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(username, [
        "id",
        "username",
        "email",
    ]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const uid = player instanceof Player ? player.uid : player.id;
    const uidBindInfo = await dbManager.getFromUid(uid, {
        projection: { _id: 0 },
    });

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBindedError"),
            ),
        });
    }

    const userBindInfo = await dbManager.getFromUser(interaction.user, {
        projection: {
            _id: 0,
            previous_bind: 1,
        },
    });

    if (userBindInfo) {
        const isUidBinded = userBindInfo.isUidBinded(uid);

        if (!isUidBinded) {
            if (email !== player.email) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("incorrectEmail"),
                    ),
                });
            }

            const confirmation = await MessageButtonCreator.createConfirmation(
                interaction,
                {
                    content: MessageCreator.createWarn(
                        localization.getTranslation(
                            "newAccountBindConfirmation",
                        ),
                        username,
                    ),
                },
                [interaction.user.id],
                10,
                localization.language,
            );

            if (!confirmation) {
                return;
            }
        }

        const result = await userBindInfo.bind(player, localization.language);

        if (result.failed()) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountBindError"),
                    player.username,
                    result.reason,
                ),
            });
        }

        if (isUidBinded) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("oldAccountBindSuccessful"),
                    player.username,
                ),
            });
        } else {
            await DatabaseManager.aliceDb.collections.accountTransfer.updateOne(
                {
                    discordId: interaction.user.id,
                },
                {
                    $push: { transferList: uid },
                    $setOnInsert: { transferUid: userBindInfo.uid },
                },
                { upsert: true },
            );

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("newAccountBindSuccessful"),
                    player.username,
                    (1 - userBindInfo.previous_bind.length).toString(),
                ),
            });
        }
    } else {
        if (email !== player.email) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("incorrectEmail"),
                ),
            });
        }

        const result = await dbManager.insert({
            discordid: interaction.user.id,
            uid: uid,
            username: player.username,
            previous_bind: [uid],
        });

        if (result.failed()) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountBindError"),
                    result.reason,
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountBindSuccessful"),
                player.username,
                "1",
            ),
        });
    }
};

export const config: ModalCommand["config"] = {
    replyEphemeral: true,
};
