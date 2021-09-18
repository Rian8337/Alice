import { profileStrings } from "@alice-commands/osu! and osu!droid/profile/profileStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { ArrayHelper } from "@alice-utils/helpers/ArrayHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(interaction.user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const playerInfoDbManager: PlayerInfoCollectionManager = DatabaseManager.aliceDb.collections.playerInfo;

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(interaction.user);

    const pictureConfig: ProfileImageConfig = playerInfo?.picture_config ?? playerInfoDbManager.defaultDocument.picture_config;

    const ownedBadges: PartialProfileBackground[] = pictureConfig.badges;

    if (ownedBadges.length === 0) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.userDoesntOwnAnyBadge)
        });
    }

    const badgeIndexInput = await MessageInputCreator.createInputDetector(
        interaction,
        { embeds: [ EmbedCreator.createInputEmbed(
            interaction,
            "Unequip a Profile Badge",
            "Enter the slot number where you want to unequip the badge on, from 1 to 10."
        ) ] },
        ArrayHelper.initializeArray(10, 1).map((v, i) => (v + i).toString()),
        [interaction.user.id],
        20
    );

    if (!badgeIndexInput) {
        return;
    }

    const badgeIndex: number = parseInt(badgeIndexInput) - 1;

    pictureConfig.activeBadges[badgeIndex] = null;

    await DatabaseManager.aliceDb.collections.playerInfo.update(
        { discordid: interaction.user.id }, { $set: { picture_config: pictureConfig } }
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.unequipBadgeSuccess,
            interaction.user.toString(),
            (badgeIndex + 1).toString()
        ),
        embeds: []
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};