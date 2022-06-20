import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { SelectMenuInteraction } from "discord.js";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(localization.language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user,
        {
            retrieveActiveBadges: true,
            retrieveBadges: true,
        }
    );

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    const ownedBadges: PartialProfileBackground[] = pictureConfig.badges;

    if (ownedBadges.length === 0) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntOwnAnyBadge")
            ),
        });
    }

    let selectMenuInteraction: SelectMenuInteraction | null =
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("chooseEquipBadge")
                ),
            },
            ownedBadges.map((v) => {
                return {
                    label: v.name,
                    value: v.id,
                };
            }),
            [interaction.user.id],
            30
        );

    if (!selectMenuInteraction) {
        return;
    }

    const badgeID: string = selectMenuInteraction.values[0];

    const badge: PartialProfileBackground = ownedBadges.find(
        (v) => v.id === badgeID
    )!;

    selectMenuInteraction = await SelectMenuCreator.createSelectMenu(
        interaction,
        {
            content: MessageCreator.createWarn(
                "Choose the slot number where you want to put the badge on."
            ),
        },
        ArrayHelper.initializeArray(10, 1).map((v, i) => {
            return {
                label: (v + i).toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                ),
                value: (v + i).toString(),
            };
        }),
        [interaction.user.id],
        20
    );

    if (!selectMenuInteraction) {
        return;
    }

    const badgeIndex: number = parseInt(selectMenuInteraction.values[0]) - 1;

    pictureConfig.activeBadges[badgeIndex] = badge;

    await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
        { discordid: interaction.user.id },
        { $set: { picture_config: pictureConfig } }
    );

    InteractionHelper.update(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("equipBadgeSuccess"),
            interaction.user.toString(),
            badge.id,
            (badgeIndex + 1).toString()
        ),
        embeds: [],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
