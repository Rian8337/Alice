import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (client, interaction) => {
    let clanName: string;

    const allowedConfirmations: Snowflake[] = [];

    if (interaction.options.getString("name")) {
        const staffMembers: Collection<Snowflake, GuildMember> =
            await PermissionHelper.getMainGuildStaffMembers(client);

        if (!staffMembers.has(interaction.user.id)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    Constants.noPermissionReject
                ),
            });
        }

        allowedConfirmations.push(...staffMembers.keys());

        clanName = interaction.options.getString("name", true);
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user
            );

        if (!bindInfo) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    Constants.selfNotBindedReject
                ),
            });
        }

        if (!bindInfo.clan) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.selfIsNotInClan
                ),
            });
        }

        allowedConfirmations.push(interaction.user.id);

        clanName = bindInfo.clan;
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(clanName);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntExist),
        });
    }

    // Only clan leaders and staff members can disband clan
    if (!clan.isLeader(interaction.user) && allowedConfirmations.length === 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.disbandClanConfirmation
            ),
        },
        allowedConfirmations,
        20
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await clan.disband();

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.disbandClanFailed,
                result.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(clanStrings.disbandClanSuccessful),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
