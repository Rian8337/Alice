import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Guild, GuildMember, Role } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
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

    const powerReq: number = 2000;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanPowerNotEnoughToBuyItem, powerReq.toLocaleString()
            )
        });
    }

    let clanRole: Role | undefined = await clan.getClanRole();

    if (clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanAlreadyHasClanRole)
        });
    }

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(interaction.user);

    const cost: number = 5000;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "buy a clan role",
                cost.toLocaleString()
            )
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "clan role",
                cost.toLocaleString()
            )
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await playerInfo.incrementCoins(-cost);

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.buyShopItemFailed, result.reason!
            )
        });
    }

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const globalClanRole: Role = guild.roles.cache.find(r => r.name === "Clans")!;

    clanRole = await guild.roles.create({
        name: clan.name,
        color: "DEFAULT",
        permissions: [],
        position: globalClanRole.position,
        reason: "Clan leader bought clan role"
    });

    for await (const member of clan.member_list.values()) {
        const guildMember: GuildMember | null = await guild.members.fetch(member.id).catch(() => null);

        if (guildMember) {
            await guildMember.roles.add([globalClanRole, clanRole], "Clan leader bought clan role");
        }
    }

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