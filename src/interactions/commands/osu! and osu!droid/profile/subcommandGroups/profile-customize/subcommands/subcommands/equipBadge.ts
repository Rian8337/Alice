import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { UpdateFilter } from "mongodb";
import { DatabasePlayerInfo } from "structures/database/aliceDb/DatabasePlayerInfo";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction),
    );

    const playerInfoDbManager = DatabaseManager.aliceDb.collections.playerInfo;

    const bindInfo =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    const playerInfo = await playerInfoDbManager.getFromUser(interaction.user, {
        projection: {
            _id: 0,
            "picture_config.badges": 1,
            "picture_config.activeBadges": 1,
        },
    });

    const pictureConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    const ownedBadges = pictureConfig.badges;

    if (ownedBadges.length === 0) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntOwnAnyBadge"),
            ),
        });
    }

    let selectMenuInteraction = await SelectMenuCreator.createStringSelectMenu(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("chooseEquipBadge"),
            ),
        },
        ownedBadges
            .map((v) => {
                return {
                    label: v.name,
                    value: v.id,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label)),
        [interaction.user.id],
        30,
    );

    if (!selectMenuInteraction) {
        return;
    }

    const badgeID = selectMenuInteraction.values[0];
    const badge = ownedBadges.find((v) => v.id === badgeID)!;

    selectMenuInteraction = await SelectMenuCreator.createStringSelectMenu(
        selectMenuInteraction,
        {
            content: MessageCreator.createWarn(
                "Choose the slot number where you want to put the badge on.",
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

    const badgeIndex = parseInt(selectMenuInteraction.values[0]) - 1;

    const query: UpdateFilter<DatabasePlayerInfo> = {
        $set: {},
    };

    Object.defineProperty(
        query.$set,
        `picture_config.activeBadges.${badgeIndex}`,
        {
            value: {
                id: badge.id,
                name: badge.name,
            },
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
            localization.getTranslation("equipBadgeSuccess"),
            interaction.user.toString(),
            badge.id,
            (badgeIndex + 1).toString(),
        ),
        embeds: [],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
