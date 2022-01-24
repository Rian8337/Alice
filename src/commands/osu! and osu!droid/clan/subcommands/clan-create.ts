import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Player } from "@rian8337/osu-droid-utilities";
import { clanStrings } from "../clanStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const name: string = interaction.options.getString("name", true);

    if (name.length > 25) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanNameIsTooLong),
        });
    }

    if (StringHelper.hasUnicode(name)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.clanNameHasUnicode
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    if (bindInfo.clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.selfIsAlreadyInClan
            ),
        });
    }

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user
        );

    const price: number = 7500;

    if (!playerInfo || playerInfo.alicecoins < price) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                clanStrings.notEnoughCoins,
                "create a clan",
                price.toLocaleString()
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(clanStrings.clanNameIsTaken),
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createAccept(clanStrings.profileNotFound),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                clanStrings.createClanConfirmation,
                name,
                price.toLocaleString()
            ),
        },
        [interaction.user.id],
        20
    );

    if (!confirmation) {
        return;
    }

    await bindInfo.setClan(name);

    await playerInfo.incrementCoins(-price);

    await DatabaseManager.elainaDb.collections.clan.insert({
        leader: interaction.user.id,
        name: name,
        member_list: [
            {
                id: interaction.user.id,
                rank: player.rank,
                uid: player.uid,
                battle_cooldown: 0,
                hasPermission: true,
            },
        ],
    });

    interaction.editReply({
        content: MessageCreator.createAccept(
            clanStrings.createClanSuccessful,
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
