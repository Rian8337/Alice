import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { Language } from "@alice-localization/base/Language";
import { ClanLocalization } from "@alice-localization/commands/osu! and osu!droid/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ClanLocalization = new ClanLocalization(language);

    const name: string = interaction.options.getString("name", true);

    if (name.length > 25) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameIsTooLong")
            ),
        });
    }

    if (StringHelper.hasUnicode(name)) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameHasUnicode")
            ),
        });
    }

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    if (bindInfo.clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsAlreadyInClan")
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
                localization.getTranslation("notEnoughCoins"),
                localization.getTranslation("createClan"),
                price.toLocaleString()
            ),
        });
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (clan) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameIsTaken")
            ),
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createAccept(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("createClanConfirmation"),
                name,
                price.toLocaleString()
            ),
        },
        [interaction.user.id],
        20,
        language
    );

    if (!confirmation) {
        return;
    }

    await bindInfo.setClan(name);

    await playerInfo.incrementCoins(-price, language);

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
            localization.getTranslation("createClanSuccessful"),
            name
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
