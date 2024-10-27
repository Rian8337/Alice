import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { PartialProfileBackground } from "@structures/profile/PartialProfileBackground";
import { ProfileImageConfig } from "@structures/profile/ProfileImageConfig";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { ArrayHelper } from "@utils/helpers/ArrayHelper";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { StringSelectMenuInteraction } from "discord.js";
import { DatabasePlayerInfo } from "structures/database/aliceDb/DatabasePlayerInfo";
import { UpdateFilter } from "mongodb";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        CommandHelper.getLocale(interaction),
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
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

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                "picture_config.badges": 1,
                "picture_config.activeBadges": 1,
            },
        },
    );

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    const ownedBadges: PartialProfileBackground[] = pictureConfig.badges;

    if (ownedBadges.length === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntOwnAnyBadge"),
            ),
        });
    }

    const selectMenuInteraction: StringSelectMenuInteraction | null =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("unequipBadge"),
                ),
            },
            ArrayHelper.initializeArray(10, 1).map((v, i) => {
                return {
                    label: (v + i).toLocaleString(
                        LocaleHelper.convertToBCP47(localization.language),
                    ),
                    value: (v + i).toString(),
                };
            }),
            [interaction.user.id],
            20,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const badgeIndex: number = parseInt(selectMenuInteraction.values[0]) - 1;

    const query: UpdateFilter<DatabasePlayerInfo> = {
        $set: {},
    };

    Object.defineProperty(
        query.$set,
        `picture_config.activeBadges.${badgeIndex}`,
        {
            value: null,
            configurable: true,
            enumerable: true,
            writable: true,
        },
    );

    await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
        { discordid: interaction.user.id },
        query,
    );

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("unequipBadgeSuccess"),
            interaction.user.toString(),
            (badgeIndex + 1).toString(),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
