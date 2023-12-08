import { bold, EmbedBuilder, GuildMember, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
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
import { FindOptions } from "mongodb";
import { DatabaseUserBind } from "structures/database/elainaDb/DatabaseUserBind";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    const localization: ProfileLocalization = new ProfileLocalization(
        await CommandHelper.getLocale(interaction),
    );

    if (interaction.options.data.length > 1) {
        interaction.ephemeral = true;

        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("tooManyOptions"),
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

    const findOptions: FindOptions<DatabaseUserBind> = {
        projection: {
            _id: 0,
            uid: 1,
        },
    };

    switch (true) {
        case !!uid:
            player = await Player.getInformation(uid!);

            if (player?.uid) {
                bindInfo = await dbManager.getFromUid(player.uid, findOptions);
            }

            break;
        case !!username:
            if (!StringHelper.isUsernameValid(username!)) {
                return InteractionHelper.reply(interaction, {
                    content: MessageCreator.createReject(
                        localization.getTranslation("userProfileNotFound"),
                    ),
                });
            }

            player = await Player.getInformation(username);

            if (player?.uid) {
                bindInfo = await dbManager.getFromUid(player.uid, findOptions);
            }

            break;
        default:
            // If no arguments are specified, default to self
            bindInfo = await dbManager.getFromUser(
                discordid ?? interaction.user.id,
                findOptions,
            );

            if (bindInfo?.uid) {
                player = await Player.getInformation(bindInfo.uid);
            }

            break;
    }

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userProfileNotFound"),
            ),
        });
    }

    const embed: EmbedBuilder = EmbedCreator.createNormalEmbed({
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    const BCP47: string = LocaleHelper.convertToBCP47(localization.language);

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("playerBindInfo"),
                player.username,
            ),
            iconURL: interaction.user.avatarURL()!,
            url: ProfileManager.getProfileLink(player.uid).toString(),
        })
        .setThumbnail(player.avatarURL)
        .setDescription(
            `[${localization.getTranslation("avatarLink")}](${
                player.avatarURL
            })\n\n` +
                `${bold(localization.getTranslation("uid"))}: ${player.uid}\n` +
                `${bold(
                    localization.getTranslation("rank"),
                )}: ${player.rank.toLocaleString(BCP47)}\n` +
                `${bold(
                    localization.getTranslation("playCount"),
                )}: ${player.playCount.toLocaleString(BCP47)}\n` +
                `${bold(localization.getTranslation("country"))}: ${
                    player.location
                }\n\n` +
                `${bold(localization.getTranslation("bindInformation"))}: ${
                    bindInfo
                        ? StringHelper.formatString(
                              localization.getTranslation("binded"),
                              bindInfo.discordid,
                              bindInfo.discordid,
                          )
                        : localization.getTranslation("notBinded")
                }`,
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
