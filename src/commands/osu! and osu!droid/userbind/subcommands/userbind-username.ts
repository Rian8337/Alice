import { Player } from 'osu-droid';
import { Guild, GuildMember, Role } from 'discord.js';
import { MessageCreator } from '@alice-utils/creators/MessageCreator';
import { userbindStrings } from '../userbindStrings';
import { DatabaseUserBind } from '@alice-interfaces/database/elainaDb/DatabaseUserBind';
import { DatabaseManager } from '@alice-database/DatabaseManager';
import { Constants } from '@alice-core/Constants';
import { MessageButtonCreator } from '@alice-utils/creators/MessageButtonCreator';
import { UserBindCollectionManager } from '@alice-database/managers/elainaDb/UserBindCollectionManager';
import { UserBind } from '@alice-database/utils/elainaDb/UserBind';
import { Subcommand } from '@alice-interfaces/core/Subcommand';
import { DatabaseOperationResult } from '@alice-interfaces/database/DatabaseOperationResult';

export const run: Subcommand["run"] = async (client, interaction) => {
    const username: string = interaction.options.getString("username", true);

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    const usernameBindInfo: UserBind | null = await dbManager.getFromUsername(username);

    if (usernameBindInfo && usernameBindInfo.discordid !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(userbindStrings.accountHasBeenBindedError)
        });
    }

    const userBindInfo: UserBind | null = await dbManager.getFromUser(interaction.user);

    const player: Player = await Player.getInformation({ username: username });

    if (userBindInfo) {
        if (!userBindInfo.isUidBinded(player.uid)) {
            // Binding a new account must be done inside main server
            const mainServer: Guild = await client.guilds.fetch(Constants.mainServer);

            if (interaction.guild?.id !== mainServer.id) {
                return interaction.editReply({
                    content: MessageCreator.createReject(userbindStrings.newAccountBindNotInMainServer)
                });
            }

            const role: Role = mainServer.roles.cache.find(r => r.name === "Member")!;

            if (!(<GuildMember> interaction.member).roles.cache.has(role.id)) {
                return interaction.editReply({
                    content: MessageCreator.createReject(userbindStrings.newAccountBindNotVerified)
                });
            }

            const confirmation: boolean = await MessageButtonCreator.createConfirmation(
                interaction,
                { content: MessageCreator.createWarn(
                    userbindStrings.newAccountBindConfirmation,
                    "username",
                    username
                ) },
                [interaction.user.id],
                10
            );

            if (!confirmation) {
                return;
            }
        }

        const result: DatabaseOperationResult = await userBindInfo.bind(player);

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    userbindStrings.accountBindError,
                    "username",
                    player.username,
                    result.reason!
                )
            });
        }

        if (userBindInfo.isUidBinded(player.uid)) {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    userbindStrings.oldAccountBindSuccessful,
                    "username",
                    player.username
                )
            });
        } else {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    userbindStrings.newAccountBindSuccessful,
                    "username",
                    player.username,
                    (1 - userBindInfo.previous_bind.length).toString(),
                    1 - userBindInfo.previous_bind.length !== 1 ? "s" : ""
                )
            });
        }
    } else {
        const result: DatabaseOperationResult = await dbManager.insert({
            discordid: interaction.user.id,
            uid: player.uid,
            username: player.username,
            previous_bind: [player.uid]
        });

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(userbindStrings.accountBindError, result.reason!)
            });
        }

        interaction.editReply({
            content: MessageCreator.createAccept(
                userbindStrings.newAccountBindSuccessful,
                "username",
                player.username,
                "1",
                ""
            )
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: []
};