import {
    Collection,
    GuildEmoji,
    StringSelectMenuInteraction,
} from "discord.js";
import { Constants } from "@core/Constants";
import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ProfileImageConfig } from "@structures/profile/ProfileImageConfig";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ProfileManager } from "@utils/managers/ProfileManager";
import { StringHelper } from "@utils/helpers/StringHelper";
import { PlayerInfo } from "@database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { ProfileBackground } from "@database/utils/aliceDb/ProfileBackground";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { LocaleHelper } from "@utils/helpers/LocaleHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: SlashSubcommand<false>["run"] = async (
    client,
    interaction,
) => {
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

    const backgroundList: Collection<string, ProfileBackground> =
        await DatabaseManager.aliceDb.collections.profileBackgrounds.get(
            "id",
            {},
            { projection: { _id: 0 } },
        );

    const coin: GuildEmoji = client.emojis.cache.get(
        Constants.mahiruCoinEmote,
    )!;

    const selectMenuInteraction: StringSelectMenuInteraction | null =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("chooseBackground"),
                ),
            },
            backgroundList.map((v) => {
                return {
                    label: v.name,
                    value: v.id,
                };
            }),
            [interaction.user.id],
            30,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const bgId: string = selectMenuInteraction.values[0];

    const background: ProfileBackground = backgroundList.get(bgId)!;

    const playerInfo: PlayerInfo | null =
        await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(
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
        DatabaseManager.aliceDb.collections.playerInfo.defaultDocument
            .picture_config;

    const isBackgroundOwned: boolean = !!pictureConfig.backgrounds.find(
        (v) => v.id === bgId,
    );

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    if (!isBackgroundOwned) {
        if ((playerInfo?.coins ?? 0) < 500) {
            return InteractionHelper.update(selectMenuInteraction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "coinsToBuyBackgroundNotEnough",
                    ),
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                    (playerInfo?.coins ?? 0).toLocaleString(BCP47),
                ),
            });
        }

        pictureConfig.backgrounds.push(background);
    }

    pictureConfig.activeBackground = background;

    await InteractionHelper.deferUpdate(selectMenuInteraction);

    const image: Buffer | null = await ProfileManager.getProfileStatistics(
        bindInfo.uid,
        undefined,
        bindInfo,
        playerInfo,
        true,
        localization.language,
    );

    if (!image) {
        return InteractionHelper.update(selectMenuInteraction, {
            content: MessageCreator.createReject(
                localization.getTranslation("selfProfileNotFound"),
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        selectMenuInteraction,
        {
            content: MessageCreator.createWarn(
                isBackgroundOwned
                    ? StringHelper.formatString(
                          localization.getTranslation(
                              "switchBackgroundConfirmation",
                          ),
                          interaction.user.toString(),
                      )
                    : StringHelper.formatString(
                          localization.getTranslation(
                              "buyBackgroundConfirmation",
                          ),
                          interaction.user.toString(),
                          coin.toString(),
                      ),
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

    // Safe to assume that the user already has an entry
    // in database as we checked if the user has 500 Mahiru coins earlier.
    await DatabaseManager.aliceDb.collections.playerInfo.updateOne(
        { discordid: interaction.user.id },
        {
            $set: {
                "picture_config.activeBackground": {
                    id: background.id,
                    name: background.name,
                },
            },
            $push: {
                "picture_config.backgrounds": !isBackgroundOwned
                    ? { id: background.id, name: background.name }
                    : undefined,
            },
            $inc: { coins: isBackgroundOwned ? 0 : -500 },
        },
    );

    InteractionHelper.update(selectMenuInteraction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("switchBackgroundSuccess") +
                (isBackgroundOwned
                    ? ""
                    : ` ${StringHelper.formatString(
                          localization.getTranslation("mahiruCoinAmount"),
                          coin.toString(),
                          playerInfo!.coins.toLocaleString(BCP47),
                      )}`),
            interaction.user.toString(),
            background.name,
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
