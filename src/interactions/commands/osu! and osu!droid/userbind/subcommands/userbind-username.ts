import { Player } from "@rian8337/osu-droid-utilities";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { UserbindLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { Constants } from "@alice-core/Constants";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { DroidHelper } from "@alice-utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new UserbindLocalization(
        await CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const username = interaction.options.getString("username", true);
    const email = interaction.options.getString("email");
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

            const confirmation: boolean =
                await MessageButtonCreator.createConfirmation(
                    interaction,
                    {
                        content: MessageCreator.createWarn(
                            localization.getTranslation(
                                "newAccountUsernameBindConfirmation",
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

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountUsernameBindError"),
                    player.username,
                    result.reason!,
                ),
            });
        }

        if (isUidBinded) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation(
                        "oldAccountUsernameBindSuccessful",
                    ),
                    player.username,
                ),
            });
        } else {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation(
                        "newAccountUsernameBindSuccessful",
                    ),
                    player.username,
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

        if (!result.success) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("accountUsernameBindError"),
                    result.reason!,
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountUsernameBindSuccessful"),
                player.username,
                "1",
            ),
        });
    }
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
