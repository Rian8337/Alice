import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { Player } from "@rian8337/osu-droid-utilities";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { ProfileLocalization } from "@alice-localization/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";

export const run: Subcommand["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | undefined;

    switch (true) {
        case !!uid:
            player = await Player.getInformation({ uid: uid! });
            if (player.uid) {
                bindInfo = await dbManager.getFromUid(player.uid);
            }
            break;
        case !!username:
            player = await Player.getInformation({ username: username! });
            if (player.uid) {
                bindInfo = await dbManager.getFromUid(player.uid);
            }
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            if (bindInfo?.uid) {
                player = await Player.getInformation({ uid: bindInfo.uid });
            }
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
            if (bindInfo?.uid) {
                player = await Player.getInformation({ uid: bindInfo.uid });
            }
    }

    if (!player?.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                localization.getTranslation("userProfileNotFound")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("playerBindInfo"),
                player.username
            ),
            iconURL: interaction.user.avatarURL({ dynamic: true })!,
            url: `http://ops.dgsrz.com/profile.php?uid=${player.uid}`,
        })
        .setThumbnail(player.avatarURL)
        .setDescription(
            `[${localization.getTranslation("avatarLink")}](${
                player.avatarURL
            })\n\n` +
                `**${localization.getTranslation("uid")}**: ${player.uid}\n` +
                `**${localization.getTranslation(
                    "rank"
                )}**: ${player.rank.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n` +
                `**${localization.getTranslation(
                    "playCount"
                )}**: ${player.playCount.toLocaleString(
                    LocaleHelper.convertToBCP47(localization.language)
                )}\n` +
                `**${localization.getTranslation("country")}**: ${
                    player.location
                }\n\n` +
                `**${localization.getTranslation("bindInformation")}**: ${
                    bindInfo
                        ? StringHelper.formatString(
                              localization.getTranslation("binded"),
                              bindInfo.discordid,
                              bindInfo.discordid
                          )
                        : "notBinded"
                }`
        );

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
