import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DatabaseOperationResult } from "@alice-interfaces/database/DatabaseOperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ColorResolvable, Role } from "discord.js";

export const run: Subcommand["run"] = async (_, interaction) => {
    const color: string = interaction.options.getString("color", true);

    if (!StringHelper.isValidHexCode(color)) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.invalidClanRoleHexCode)
        });
    }

    // Restrict reserved role color for admin/mod/helper/ref
    if (["#3498DB", "#9543BA", "#FFD78C", "#4C6876"].includes(color)) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanRoleHexCodeIsRestricted)
        });
    }

    const clan: Clan | null = await DatabaseManager.elainaDb.collections.clan.getFromUser(interaction.user);

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan)
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfHasNoAdministrativePermission)
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanDoesntHaveClanRole)
        });
    }

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(interaction.user);

    const cost: number = 500;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "buy a clan role color change",
                cost.toLocaleString()
            )
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "clan role color change",
                cost.toLocaleString()
            )
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const result: DatabaseOperationResult = await playerInfo.incrementCoins(-cost);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed, result.reason!
            )
        });
    }

    await clanRole.setColor(<ColorResolvable> color);

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.buyShopItemSuccessful,
            cost.toLocaleString()
        )
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};