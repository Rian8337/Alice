import { Collection, GuildEmoji } from "discord.js";
import { profileStrings } from "@alice-commands/osu! and osu!droid/profile/profileStrings";
import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { ProfileImageConfig } from "@alice-interfaces/profile/ProfileImageConfig";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { MessageInputCreator } from "@alice-utils/creators/MessageInputCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { ProfileBackground } from "@alice-database/utils/aliceDb/ProfileBackground";

export const run: Subcommand["run"] = async (client, interaction) => {
    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(interaction.user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const backgroundList: Collection<string, ProfileBackground> = await DatabaseManager.aliceDb.collections.profileBackgrounds.get("name");

    const coin: GuildEmoji = client.emojis.cache.get(Constants.aliceCoinEmote)!;

    const bgName: string | undefined = await MessageInputCreator.createInputDetector(
        interaction,
        {
            embeds: [
                EmbedCreator.createInputEmbed(
                    interaction,
                    "Change Profile Card Background",
                    `Enter the name of the background that you want to use.\n\nIf you don't own the background, you will be prompted to buy it. A background costs ${coin}\`500\` Alice coins.`
                )
            ]
        },
        backgroundList.map(v => v.name),
        [interaction.user.id],
        20
    );

    if (!bgName) {
        return;
    }

    const background: ProfileBackground = backgroundList.get(bgName)!;

    const playerInfo: PlayerInfo | null = await DatabaseManager.aliceDb.collections.playerInfo.getFromUser(interaction.user);

    const pictureConfig: ProfileImageConfig =
        playerInfo?.picture_config ?? DatabaseManager.aliceDb.collections.playerInfo.defaultDocument.picture_config;

    const isBackgroundOwned: boolean = !!pictureConfig.backgrounds.find(v => v.name === bgName);

    if (!isBackgroundOwned) {
        if ((playerInfo?.alicecoins ?? 0) < 500) {
            return interaction.editReply({
                content: MessageCreator.createReject(
                    profileStrings.coinsToBuyBackgroundNotEnough,
                    coin.toString(),
                    coin.toString(),
                    coin.toString(),
                    (playerInfo?.alicecoins ?? 0).toLocaleString()
                )
            });
        }

        pictureConfig.backgrounds.push(background);
    }

    pictureConfig.activeBackground = background;

    const image: Buffer | null = await ProfileManager.getProfileStatistics(bindInfo.uid, undefined, bindInfo, playerInfo, undefined, true);

    if (!image) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.profileNotFound, "your")
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                isBackgroundOwned ?
                StringHelper.formatString(
                    profileStrings.switchBackgroundConfirmation,
                    interaction.user.toString()
                )
                :
                StringHelper.formatString(
                    profileStrings.buyBackgroundConfirmation,
                    interaction.user.toString(),
                    coin.toString()
                )
            ),
            files: [image],
            embeds: []
        },
        [interaction.user.id],
        15
    );

    if (!confirmation) {
        return;
    }

    // Safe to assume that the user already has an entry
    // in database as we checked if the user has 500 Alice coins earlier.
    await DatabaseManager.aliceDb.collections.playerInfo.update(
        { discordid: interaction.user.id }, { $set: { picture_config: pictureConfig }, $inc: { alicecoins: isBackgroundOwned ? 0 : -500 } }
    );

    interaction.editReply({
        content: MessageCreator.createAccept(
            profileStrings.switchBackgroundSuccess,
            interaction.user.toString(),
            bgName,
            isBackgroundOwned ? "" : ` You now have ${coin}\`${playerInfo?.alicecoins}\` Alice coins.`
        ),
        embeds: [],
        files: []
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};