import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { Player } from "@rian8337/osu-droid-utilities";
import { DroidHelper } from "@utils/helpers/DroidHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    const name = interaction.options.getString("name", true);

    if (name.length > 25) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameIsTooLong"),
            ),
        });
    }

    if (StringHelper.hasUnicode(name)) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameHasUnicode"),
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    clan: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    if (bindInfo.clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfIsAlreadyInClan"),
            ),
        });
    }

    const playerInfo =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    coins: 1,
                },
            },
        );

    const price = 7500;
    const BCP47 = LocaleHelper.convertToBCP47(localization.language);

    if (!playerInfo || playerInfo.coins < price) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("notEnoughCoins"),
                localization.getTranslation("createClan"),
                price.toLocaleString(BCP47),
            ),
        });
    }

    const clan =
        await DatabaseManager.elainaDb.collections.clan.getFromName(name);

    if (clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanNameIsTaken"),
            ),
        });
    }

    const player = await DroidHelper.getPlayer(bindInfo.uid, ["id"]);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("profileNotFound"),
            ),
        });
    }

    const confirmation = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("createClanConfirmation"),
                name,
                price.toLocaleString(BCP47),
            ),
        },
        [interaction.user.id],
        20,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    await bindInfo.setClan(name);
    await playerInfo.incrementCoins(-price, localization.language);

    const rank =
        player instanceof Player
            ? player.rank
            : ((await DroidHelper.getPlayerPPRank(player.id)) ?? 0);

    await DatabaseManager.elainaDb.collections.clan.insert({
        leader: interaction.user.id,
        name: name,
        member_list: [
            {
                id: interaction.user.id,
                rank: rank,
                uid: bindInfo.uid,
                battle_cooldown: 0,
                hasPermission: true,
            },
        ],
    });

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("createClanSuccessful"),
            name,
        ),
    });
};
