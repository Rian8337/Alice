import { profileStrings } from "@alice-commands/osu! and osu!droid/profile/profileStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";

export const run: Subcommand["run"] = async (_, interaction) => {
    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject),
        });
    }

    const color: string | undefined =
        await MessageInputCreator.createInputDetector(
            interaction,
            {
                embeds: [
                    EmbedCreator.createInputEmbed(
                        interaction,
                        "Change Information Box Text Color",
                        "Enter the color that you want to use.\n\nThis can be in RGBA format (e.g. 255,0,0,1) or hex code (e.g. #008BFF)"
                    ),
                ],
            },
            [],
            [interaction.user.id],
            20
        );

    if (!color) {
        return;
    }

    // RGBA
    if (color.includes(",")) {
        const RGBA: number[] = color.split(",").map((v) => parseFloat(v));

        if (RGBA.length !== 4) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    profileStrings.invalidRGBAformat
                ),
            });
        }

        if (
            RGBA.slice(0, 3).some(
                (v) => !NumberHelper.isNumberInRange(v, 0, 255, true)
            )
        ) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    profileStrings.invalidRGBAformat
                ),
            });
        }

        if (!NumberHelper.isNumberInRange(RGBA[3], 0, 1, true)) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    profileStrings.invalidRGBAformat
                ),
            });
        }
    } else if (!StringHelper.isValidHexCode(color)) {
        return interaction.editReply({
            content: MessageCreator.createAccept(profileStrings.invalidHexCode),
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

    pictureConfig.textColor = color;

    const image: Buffer | null = await ProfileManager.getProfileStatistics(
        bindInfo.uid,
        undefined,
        bindInfo,
        playerInfo,
        undefined,
        true
    );

    if (!image) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                profileStrings.profileNotFound,
                "your"
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                profileStrings.changeInfoColorConfirmation,
                interaction.user.toString(),
                "text",
                color
            ),
            files: [image],
            embeds: [],
        },
        [interaction.user.id],
        15
    );

    if (!confirmation) {
        return;
    }

    if (playerInfo) {
        await DatabaseManager.aliceDb.collections.playerInfo.update(
            { discordid: interaction.user.id },
            { $set: { picture_config: pictureConfig } }
        );
    } else {
        await DatabaseManager.aliceDb.collections.playerInfo.insert({
            discordid: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            picture_config: pictureConfig,
        });
    }

    return interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.changeInfoColorSuccess,
            interaction.user.toString(),
            "text",
            color
        ),
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
