import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Snowflake, Collection, GuildMember } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    let clanName: string;

    const allowedConfirmations: Snowflake[] = [];

    if (interaction.options.getString("name")) {
        const staffMembers: Collection<Snowflake, GuildMember> =
            await PermissionHelper.getMainGuildStaffMembers(client);

        if (!staffMembers.has(interaction.user.id)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    clanStrings.selfHasNoAdministrativePermission
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

        clanName = bindInfo.clan;
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(clanName);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntExist),
        });
    }

    // Only clan co-leaders, leaders, and staff members can remove clan icons
    if (
        !clan.hasAdministrativePower(interaction.user) &&
        allowedConfirmations.length === 1
    ) {
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
                clanStrings.removeBannerConfirmation
            ),
        },
        allowedConfirmations,
        20
    );

    if (!confirmation) {
        return;
    }

    const setResult: OperationResult = await clan.setBanner();

    if (!setResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.removeBannerFailed,
                setResult.reason!
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.removeBannerFailed,
                setResult.reason!
            ),
        });
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.removeBannerSuccessful
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
