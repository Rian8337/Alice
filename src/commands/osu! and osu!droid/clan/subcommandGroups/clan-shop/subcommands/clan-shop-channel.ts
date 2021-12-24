import { clanStrings } from "@alice-commands/osu! and osu!droid/clan/clanStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Guild, GuildChannel, Role, TextChannel } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.selfIsNotInClan),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfHasNoAdministrativePermission
            ),
        });
    }

    const powerReq: number = 5000;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanPowerNotEnoughToBuyItem,
                powerReq.toLocaleString()
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanDoesntHaveClanRole
            ),
        });
    }

    const channel: TextChannel | undefined = await clan.getClanChannel();

    if (channel) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanAlreadyHasChannel
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 50000;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "buy a clan channel",
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.buyShopItemConfirmation,
                "clan channel",
                cost.toLocaleString()
            ),
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
                clanStrings.buyShopItemFailed,
                result.reason!
            ),
        });
    }

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const position: number = (<GuildChannel>(
        guild.channels.cache.get("696663321633357844")
    )).position;

    const clanChannel: GuildChannel = await guild.channels.create(clan.name, {
        topic: `Clan chat for ${clan.name} clan.`,
        parent: "696646649128288346",
        permissionOverwrites: [
            {
                id: clanRole,
                allow: ["VIEW_CHANNEL"],
                type: "role",
            },
            {
                id: "353397345636974593",
                deny: ["VIEW_CHANNEL"],
                type: "role",
            },
            {
                id: "369108742077284353",
                allow: ["VIEW_CHANNEL", "MANAGE_MESSAGES"],
                type: "role",
            },
            {
                id: clan.leader,
                allow: ["MANAGE_MESSAGES"],
                type: "member",
            },
        ],
    });

    await clanChannel.setPosition(position);

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.buyShopItemSuccessful,
            cost.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
