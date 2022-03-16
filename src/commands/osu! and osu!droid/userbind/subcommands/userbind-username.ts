import { Player } from "@rian8337/osu-droid-utilities";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { UserbindLocalization } from "@alice-localization/commands/osu! and osu!droid/userbind/UserbindLocalization";
import { Constants } from "@alice-core/Constants";

export const run: Subcommand["run"] = async (client, interaction) => {
    const localization: UserbindLocalization = new UserbindLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const username: string = interaction.options.getString("username", true);

    const email: string | null = interaction.options.getString("email");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const player: Player = await Player.getInformation({ username: username });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    const uidBindInfo: UserBind | null = await dbManager.getFromUid(player.uid);

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBindedError")
            ),
        });
    }

    const userBindInfo: UserBind | null = await dbManager.getFromUser(
        interaction.user
    );

    if (userBindInfo) {
        if (!userBindInfo.isUidBinded(player.uid)) {
            if (interaction.guild?.id !== Constants.mainServer) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation(
                            "newAccountBindNotInMainServer"
                        )
                    ),
                });
            }

            if (!email) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("emailNotSpecified")
                    ),
                });
            }

            if (email !== player.email) {
                return interaction.editReply({
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
                                "newAccountUsernameBindConfirmation"
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
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("accountUsernameBindError"),
                    player.username,
                    result.reason!
                ),
            });
        }

        if (userBindInfo.isUidBinded(player.uid)) {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation(
                        "oldAccountUsernameBindSuccessful"
                    ),
                    player.username
                ),
            });
        } else {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation(
                        "newAccountUsernameBindSuccessful"
                    ),
                    player.username,
                    (1 - userBindInfo.previous_bind.length).toString()
                ),
            });
        }
    } else {
        if (interaction.guild?.id !== Constants.mainServer) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("newAccountBindNotInMainServer")
                ),
            });
        }

        if (!email) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("emailNotSpecified")
                ),
            });
        }

        if (email !== player.email) {
            return interaction.editReply({
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
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("accountUsernameBindError"),
                    result.reason!
                ),
            });
        }

        interaction.editReply({
            content: MessageCreator.createAccept(
                localization.getTranslation("newAccountUsernameBindSuccessful"),
                player.username,
                "1"
            ),
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
