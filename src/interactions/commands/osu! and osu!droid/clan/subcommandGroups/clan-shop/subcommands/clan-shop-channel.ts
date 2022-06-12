import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Guild, GuildChannel, Role, TextChannel } from "discord.js";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/clan/ClanLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand["run"] = async (client, interaction) => {
    const localization: ClanLocalization = new ClanLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromUser(
            interaction.user
        );

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsNotInClan")
            ),
        });
    }

    if (!clan.isLeader(interaction.user)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfHasNoAdministrativePermission")
            ),
        });
    }

    const powerReq: number = 5000;

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (clan.power < powerReq) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanPowerNotEnoughToBuyItem"),
                powerReq.toLocaleString(BCP47)
            ),
        });
    }

    const clanRole: Role | undefined = await clan.getClanRole();

    if (!clanRole) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntHaveClanRole")
            ),
        });
    }

    const channel: TextChannel | undefined = await clan.getClanChannel();

    if (channel) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanAlreadyHasChannel")
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const cost: number = 50000;

    if (!playerInfo || playerInfo.alicecoins < cost) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                StringHelper.formatString(
                    localization.getTranslation("buyShopItem"),
                    localization.getTranslation("clanChannel")
                ),
                cost.toLocaleString(BCP47)
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("buyShopItemConfirmation"),
                localization.getTranslation("clanChannel"),
                cost.toLocaleString(BCP47)
            ),
        },
        [interaction.user.id],
        20,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    const result: OperationResult = await playerInfo.incrementCoins(
        -cost,
        localization.language
    );

    if (!result.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("buyShopItemFailed"),
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

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("buyShopItemSuccessful"),
            cost.toLocaleString(BCP47)
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
