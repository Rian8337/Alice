import { Player } from "@rian8337/osu-droid-utilities";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { UserbindLocalization } from "@alice-localization/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { Constants } from "@alice-core/Constants";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: UserbindLocalization = new UserbindLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const uid: number = interaction.options.getInteger("uid", true);

    const email: string | null = interaction.options.getString("email");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const uidBindInfo: UserBind | null = await dbManager.getFromUid(uid);

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBindedError")
            ),
        });
    }

    const userBindInfo: UserBind | null = await dbManager.getFromUser(
        interaction.user
    );

    await InteractionHelper.defer(interaction);

    // TODO: this is a lot of duplicate codes. should consider moving to a function

    const player: Player = await Player.getInformation({ uid: uid });

    if (!player.username) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    if (userBindInfo) {
        if (!userBindInfo.isUidBinded(uid)) {
            if (interaction.guild?.id !== Constants.mainServer) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "newAccountBindNotInMainServer"
                        )
                    ),
                });
            }

            if (!email) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("emailNotSpecified")
                    ),
                });
            }

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
                                "newAccountUidBindConfirmation"
                            ),
                            uid.toString()
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
                    localization.getTranslation("accountUidBindError"),
                    uid.toString(),
                    result.reason!
                ),
            });
        }

        if (userBindInfo.isUidBinded(uid)) {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("oldAccountUidBindSuccessful"),
                    player.uid.toString()
                ),
            });
        } else {
            InteractionHelper.reply(interaction, {
                content: MessageCreator.createAccept(
                    localization.getTranslation("newAccountUidBindSuccessful"),
                    player.uid.toString(),
                    (1 - userBindInfo.previous_bind.length).toString()
                ),
            });
        }
    } else {
        if (interaction.guild?.id !== Constants.mainServer) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("newAccountBindNotInMainServer")
                ),
            });
        }

        if (!email) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("emailNotSpecified")
                ),
            });
        }

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
                    localization.getTranslation("accountUidBindError"),
                    result.reason!
                ),
            });
        }

        InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountUidBindSuccessful"),
                player.uid.toString(),
                "1"
            ),
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
