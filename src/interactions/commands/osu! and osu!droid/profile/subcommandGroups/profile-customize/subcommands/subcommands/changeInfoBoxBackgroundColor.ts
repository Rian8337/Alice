import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileImageConfig } from "@structures/profile/ProfileImageConfig";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { MessageInputCreator } from "@utils/creators/MessageInputCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { NumberHelper } from "@utils/helpers/NumberHelper";
import { StringHelper } from "@utils/helpers/StringHelper";
import { ProfileManager } from "@utils/managers/ProfileManager";

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
                    uid: 1,
                    username: 1,
                    pptotal: 1,
                    clan: 1,
                    weightedAccuracy: 1,
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

    // TODO: replace with modals/text input interaction
    const color: string | undefined =
        await MessageInputCreator.createInputDetector(
            interaction,
            {
                embeds: [
                    EmbedCreator.createInputEmbed(
                        interaction,
                        localization.getTranslation(
                            "changeInfoBoxBackgroundColorTitle",
                        ),
                        `${localization.getTranslation(
                            "enterColor",
                        )}\n\n${localization.getTranslation(
                            "supportedColorFormat",
                        )}`,
                        localization.language,
                    ),
                ],
            },
            [],
            [interaction.user.id],
            20,
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
                (v) => !NumberHelper.isNumberInRange(v, 0, 255, true),
            ) ||
            !NumberHelper.isNumberInRange(RGBA[3], 0, 1, true)
        ) {
            return InteractionHelper.update(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("invalidRGBAformat"),
                ),
            });
        }
    } else if (!StringHelper.isValidHexCode(color)) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createAccept(
                localization.getTranslation("invalidHexCode"),
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
                coins: 1,
                points: 1,
            },
        },
    );

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ??
        playerInfoDbManager.defaultDocument.picture_config;

    pictureConfig.bgColor = color;

    const image: Buffer | null = await ProfileManager.getProfileStatistics(
        bindInfo.uid,
        undefined,
        bindInfo,
        playerInfo,
        true,
        localization.language,
    );

    if (!image) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfProfileNotFound"),
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation(
                    "changeInfoBackgroundColorConfirmation",
                ),
                interaction.user.toString(),
                color,
            ),
            files: [image],
            embeds: [],
        },
        [interaction.user.id],
        15,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    if (playerInfo) {
        await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
            { discordid: interaction.user.id },
            { $set: { "picture_config.bgColor": color } },
        );
    } else {
        await DatabaseManager.aliceDb.collections.playerInfo.insert({
            discordid: interaction.user.id,
            uid: bindInfo.uid,
            username: bindInfo.username,
            picture_config: pictureConfig,
        });
    }

    InteractionHelper.update(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("changeInfoBackgroundColorSuccess"),
            interaction.user.toString(),
            color,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
