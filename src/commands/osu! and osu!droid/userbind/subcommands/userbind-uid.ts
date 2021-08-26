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
    const uid: number = interaction.options.getInteger("uid", true);

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

    const uidBindInfo: UserBind | null = await dbManager.getFromUid(uid);

    if (uidBindInfo && uidBindInfo.discordid !== interaction.user.id) {
        return interaction.editReply({
            content: MessageCreator.createReject(userbindStrings.accountHasBeenBindedError)
        });
    }

    // TODO: this is a lot of duplicate codes. should consider moving to a function

    const player: Player = await Player.getInformation({ uid: uid });

    if (uidBindInfo) {
        if (!uidBindInfo.isUidBinded(uid)) {
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
                    "uid",
                    uid.toString()
                ) },
                [interaction.user.id],
                10
            );

            if (!confirmation) {
                return;
            }
        }

        const result: DatabaseOperationResult = await uidBindInfo.bind(player);

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(userbindStrings.accountBindError, result.reason!)
            });
        }

        if (uidBindInfo.isUidBinded(uid)) {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    userbindStrings.oldAccountBindSuccessful,
                    "uid",
                    player.uid.toString()
                )
            });
        } else {
            interaction.editReply({
                content: MessageCreator.createAccept(
                    userbindStrings.newAccountBindSuccessful,
                    "uid",
                    player.uid.toString(),
                    (1 - uidBindInfo.previous_bind.length).toString(),
                    1 - uidBindInfo.previous_bind.length !== 1 ? "s" : ""
                )
            });
        }
    } else {
        const doc: DatabaseUserBind = dbManager.defaultDocument;

        doc.discordid = interaction.user.id;
        doc.uid = player.uid;
        doc.username = player.username;
        doc.previous_bind.push(player.uid);

        const result: DatabaseOperationResult = await dbManager.insert(doc);

        if (!result.success) {
            return interaction.editReply({
                content: MessageCreator.createReject(userbindStrings.accountBindError, result.reason!)
            });
        }

        interaction.editReply({
            content: MessageCreator.createAccept(
                userbindStrings.newAccountBindSuccessful,
                "uid",
                player.uid.toString(),
                "1",
                ""
            )
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: []
};