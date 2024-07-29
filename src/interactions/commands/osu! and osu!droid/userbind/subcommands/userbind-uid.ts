import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { UserbindLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Constants } from "@alice-core/Constants";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new UserbindLocalization(
        CommandHelper.getLocale(interaction),
    );

    const uid = interaction.options.getInteger("uid", true);
    const email = interaction.options.getString("email");

    const dbManager = DatabaseManager.elainaDb.collections.userBind;
    const uidBindInfo = await dbManager.getFromUid(uid, {
        projection: { _id: 0, discordid: 1 },
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

    await InteractionHelper.deferReply(interaction);

    // TODO: this is a lot of duplicate codes. should consider moving to a function

    const player = await DroidHelper.getPlayer(uid, [
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

    if (userBindInfo) {
        const isUidBinded = userBindInfo.isUidBinded(uid);

        if (!isUidBinded) {
            if (interaction.guild?.id !== Constants.mainServer) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "newAccountBindNotInMainServer",
                        ),
                    ),
                });
            }

            if (!email) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("emailNotSpecified"),
                    ),
                });
            }

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
                            "newAccountUidBindConfirmation",
                        ),
                        uid.toString(),
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

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountUidBindError"),
                    uid.toString(),
                    result.reason!,
                ),
            });
        }

        if (isUidBinded) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("oldAccountUidBindSuccessful"),
                    uid.toString(),
                ),
            });
        } else {
            await DatabaseManager.aliceDb.collections.accountTransfer.updateOne(
                {
                    discordId: interaction.user.id,
                },
                {
                    $push: {
                        transferList: uid,
                    },
                    $setOnInsert: {
                        transferUid: userBindInfo.uid,
                        transferList: userBindInfo.previous_bind,
                    },
                },
                { upsert: true },
            );

            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("newAccountUidBindSuccessful"),
                    uid.toString(),
                    (1 - userBindInfo.previous_bind.length).toString(),
                ),
            });
        }
    } else {
        if (interaction.guild?.id !== Constants.mainServer) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "newAccountBindNotInMainServer",
                    ),
                ),
            });
        }

        if (!email) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("emailNotSpecified"),
                ),
            });
        }

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
                    localization.getTranslation("accountUidBindError"),
                    result.reason,
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountUidBindSuccessful"),
                uid.toString(),
                "1",
            ),
        });
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
