import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Guild, GuildMember, Role } from "discord.js";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";

export const run: Subcommand["run"] = async (client, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const powerReq: number = 2000;

    if (clan.power < powerReq) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerNotEnoughToBuyItem"),
                powerReq.toLocaleString()
            ),
        });
    }

    let clanRole: Role | undefined = await clan.getClanRole();

    if (clanRole) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanAlreadyHasClanRole")
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 5000;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                StringHelper.formatString(
                    localization.getTranslation("buyShopItem"),
                    localization.getTranslation("clanRole")
                ),
                cost.toLocaleString()
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("buyShopItemConfirmation"),
                localization.getTranslation("clanRole"),
                cost.toLocaleString()
            ),
        },
        [interaction.user.id],
        20,
        language
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -cost,
        language
    );

    if (!result.success) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
                result.reason!
            ),
        });
    }

    const guild: Guild = await client.guilds.fetch(Constants.mainServer);

    const globalClanRole: Role = guild.roles.cache.find(
        (r) => r.name === "Clans"
    )!;

    clanRole = await guild.roles.create({
        name: clan.name,
        color: "DEFAULT",
        permissions: [],
        position: globalClanRole.position,
        reason: "Clan leader bought clan role",
    });

    for (const member of clan.member_list.values()) {
        const guildMember: GuildMember | null = await guild.members
            .fetch(member.id)
            .catch(() => null);

        if (guildMember) {
            await guildMember.roles.add(
                [globalClanRole, clanRole],
                "Clan leader bought clan role"
            );
        }
    }

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("buyShopItemSuccessful"),
            cost.toLocaleString()
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
