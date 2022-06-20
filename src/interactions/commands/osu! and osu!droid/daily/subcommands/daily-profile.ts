import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { DailyLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/daily/DailyLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { GuildEmoji, GuildMember, MessageEmbed, Snowflake } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction
) => {
    const localization: DailyLocalization = new DailyLocalization(
        await CommandHelper.getLocale(interaction)
    );

    const discordid: Snowflake | undefined =
        interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    const coin: GuildEmoji = client.emojis.resolve(Constants.aliceCoinEmote)!;

    const dbManager: PlayerInfoCollectionManager =
        DatabaseManager.aliceDb.collections.playerInfo;

    let playerInfo: PlayerInfo | null;

    switch (true) {
        case !!uid:
            playerInfo = await dbManager.getFromUid(uid!, {
                retrieveChallengeData: true,
            });
            break;
        case !!username:
            playerInfo = await dbManager.getFromUsername(username!, {
                retrieveChallengeData: true,
            });
            break;
        case !!discordid:
            playerInfo = await dbManager.getFromUser(discordid!, {
                retrieveChallengeData: true,
            });
            break;
        default:
            // If no arguments are specified, default to self
            playerInfo = await dbManager.getFromUser(interaction.user, {
                retrieveChallengeData: true,
            });
    }

    if (!playerInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userHasNotPlayedAnyChallenge")
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        color: (<GuildMember>interaction.member).displayColor,
    });

    embed
        .setAuthor({
            name: StringHelper.formatString(
                localization.getTranslation("profile"),
                playerInfo.username
            ),
            iconURL: "https://image.frl/p/beyefgeq5m7tobjg.jpg",
            url: ProfileManager.getProfileLink(playerInfo.uid).toString(),
        })
        .addField(
            localization.getTranslation("statistics"),
            `**${localization.getTranslation("points")}**: ${
                playerInfo.points
            }\n**Alice Coins**: ${coin}${
                playerInfo.alicecoins
            }\n**${localization.getTranslation("challengesCompleted")}**: ${
                playerInfo.challenges.size
            }`
        );

    InteractionHelper.reply(interaction, {
        embeds: [embed],
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
