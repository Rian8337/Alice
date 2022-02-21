import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { Language } from "@alice-localization/base/Language";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/ConstantsLocalization";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { SelectMenuCreator } from "@alice-utils/creators/SelectMenuCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const localization: ProfileLocalization = new ProfileLocalization(language);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(new ConstantsLocalization(language).getTranslation(Constants.selfNotBindedReject)),
        });
    }

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user
    );

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    const ownedBadges: PartialProfileBackground[] = pictureConfig.badges;

    if (ownedBadges.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userDoesntOwnAnyBadge")
            ),
        });
    }

    const badgeIndexInput: string | undefined = (
        await SelectMenuCreator.createSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("unequipBadge")
                ),
            },
            ArrayHelper.initializeArray(10, 1).map((v, i) => {
                return {
                    label: (v + i).toLocaleString(),
                    value: (v + i).toString(),
                };
            }),
            [interaction.user.id],
            20
        )
    )[0];

    if (!badgeIndexInput) {
        return;
    }

    const badgeIndex: number = parseInt(badgeIndexInput) - 1;

    pictureConfig.activeBadges[badgeIndex] = null;

    await DatabaseManager.aliceDb.collections.playerInfo.update(
        { discordid: interaction.user.id },
        { $set: { picture_config: pictureConfig } }
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            localization.getTranslation("unequipBadgeSuccess"),
            interaction.user.toString(),
            (badgeIndex + 1).toString()
        ),
        embeds: [],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
