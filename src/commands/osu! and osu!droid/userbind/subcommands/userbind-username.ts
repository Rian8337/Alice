import { Player } from "@rian8337/osu-droid-utilities";
import { Guild, GuildMember, Role } from "discord.js";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Constants } from "@alice-core/Constants";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { ScoreHelper } from "@alice-utils/helpers/ScoreHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { UserbindLocalization } from "@alice-localization/commands/osu! and osu!droid/UserbindLocalization";
import { Language } from "@alice-localization/base/Language";

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: UserbindLocalization = new UserbindLocalization(language);

    const username: string = interaction.options.getString("username", true);

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    const usernameBindInfo: UserBind | null = await dbManager.getFromUsername(
        username
    );

    if (
        usernameBindInfo &&
        usernameBindInfo.discordid !== interaction.user.id
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("accountHasBeenBindedError")
            ),
        });
    }

    const userBindInfo: UserBind | null = await dbManager.getFromUser(
        interaction.user
    );

    const player: Player = await Player.getInformation({ username: username });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    if (userBindInfo) {
        if (!userBindInfo.isUidBinded(player.uid)) {
            // Binding a new account must be done inside main server
            const mainServer: Guild = await client.guilds.fetch(
                Constants.mainServer
            );

            if (interaction.guild?.id !== mainServer.id) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("newAccountBindNotInMainServer")
                    ),
                });
            }

            const role: Role = mainServer.roles.cache.find(
                (r) => r.name === "Member"
            )!;

            if (!(<GuildMember>interaction.member).roles.cache.has(role.id)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("newAccountBindNotVerified")
                    ),
                });
            }

            // Check if account has played verification map
            if (!(await ScoreHelper.hasPlayedVerificationMap(player.uid))) {
                2;
                return interaction.editReply({
                    content: MessageCreator.createReject(
                        localization.getTranslation("verificationMapNotFound")
                    ),
                });
            }

            const confirmation: boolean =
                await MessageButtonCreator.createConfirmation(
                    interaction,
                    {
                        content: MessageCreator.createWarn(
                            localization.getTranslation("newAccountUsernameBindConfirmation"),
                            username
                        ),
                    },
                    [interaction.user.id],
                    10,
                    language
                );

            if (!confirmation) {
                return;
            }
        }

        const result: OperationResult = await userBindInfo.bind(player, language);

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
                    localization.getTranslation("oldAccountUsernameBindSuccessful"),
                    player.username
                ),
            });
        } else {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    localization.getTranslation("newAccountUsernameBindSuccessful"),
                    player.username,
                    (1 - userBindInfo.previous_bind.length).toString(),
                    1 - userBindInfo.previous_bind.length !== 1 ? "s" : ""
                ),
            });
        }
    } else {
        // Check if account has played verification map
        if (!(await ScoreHelper.hasPlayedVerificationMap(player.uid))) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    localization.getTranslation("verificationMapNotFound")
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
                "1",
                ""
            ),
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: [],
};
