import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileImageConfig } from "@alice-structures/profile/ProfileImageConfig";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    pptotal: 1,
                    clan: 1,
                    weightedAccuracy: 1,
                },
            }
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

    const color: string | undefined =
        await MessageInputCreator.createInputDetector(
            interaction,
            {
                embeds: [
                    EmbedCreator.createInputEmbed(
                        interaction,
                        localization.getTranslation(
                            "changeInfoBoxTextColorTitle"
                        ),
                        `${localization.getTranslation(
                            "enterColor"
                        )}\n\n${localization.getTranslation(
                            "supportedColorFormat"
                        )}`,
                        localization.language
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

        if (
            RGBA.length !== 4 ||
            RGBA.slice(0, 3).some(
                (v) => !NumberHelper.isNumberInRange(v, 0, 255, true)
            ) ||
            !NumberHelper.isNumberInRange(RGBA[3], 0, 1, true)
        ) {
            return InteractionHelper.update(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("invalidRGBAformat")
                ),
            });
        }
    } else if (!StringHelper.isValidHexCode(color)) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("invalidHexCode")
            ),
        });
    }

    const playerInfoDbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    await InteractionHelper.deferUpdate(interaction);

    const playerInfo: PlayerInfo | null = await playerInfoDbManager.getFromUser(
        interaction.user,
        {
            projection: {
                _id: 0,
                picture_config: 1,
                alicecoins: 1,
                points: 1,
            },
        }
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
        true,
        localization.language
    );

    if (!image) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfProfileNotFound")
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("changeInfoTextColorConfirmation"),
                interaction.user.toString(),
                color
            ),
            files: [image],
            embeds: [],
        },
        [interaction.user.id],
        15,
        localization.language
    );

    if (!confirmation) {
        return;
    }

    if (playerInfo) {
        await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
            { discordid: interaction.user.id },
            { $set: { "picture_config.textColor": color } }
        );
    } else {
        await DatabaseManager.aliceDb.collections.playerInfo.insert({
            discordid: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            picture_config: pictureConfig,
        });
    }

    return InteractionHelper.update(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("changeInfoTextColorSuccess"),
            interaction.user.toString(),
            color
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
