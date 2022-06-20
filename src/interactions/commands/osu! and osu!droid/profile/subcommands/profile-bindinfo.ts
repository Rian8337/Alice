import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { Player } from "@rian8337/osu-droid-utilities";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { LocaleHelper } from "@alice-utils/helpers/LocaleHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction)
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const dbManager: UserBindCollectionManager =
        DatabaseManager.elainaDb.collections.userBind;

    let bindInfo: UserBind | null | undefined;

    let player: Player | null = null;

    switch (true) {
        case !!uid:
            player = await Player.getInformation(uid!);
            if (player?.uid) {
                bindInfo = await dbManager.getFromUid(player.uid);
            }
            break;
        case !!username:
            player = await Player.getInformation(username!);
            if (player?.uid) {
                bindInfo = await dbManager.getFromUid(player.uid);
            }
            break;
        case !!discordid:
            bindInfo = await dbManager.getFromUser(discordid!);
            if (bindInfo?.uid) {
                player = await Player.getInformation(bindInfo.uid);
            }
            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(interaction.user);
            if (bindInfo?.uid) {
                player = await Player.getInformation(bindInfo.uid);
            }
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userProfileNotFound")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("playerBindInfo"),
                player.username
            ),
            iconURL: interaction.user.avatarURL({ dynamic: true })!,
            url: ProfileManager.getProfileLink(player.uid).toString(),
        })
        .setThumbnail(player.avatarURL)
        .setDescription(
            `[${localization.getTranslation("avatarLink")}](${
                player.avatarURL
            })\n\n` +
                `**${localization.getTranslation("uid")}**: ${player.uid}\n` +
                `**${localization.getTranslation(
                    "rank"
                )}**: ${player.rank.toLocaleString(BCP47)}\n` +
                `**${localization.getTranslation(
                    "playCount"
                )}**: ${player.playCount.toLocaleString(BCP47)}\n` +
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
                        : localization.getTranslation("notBinded")
                }`
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};