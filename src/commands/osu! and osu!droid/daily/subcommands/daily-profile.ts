import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { DailyLocalization } from "@alice-localization/commands/osu! and osu!droid/DailyLocalization";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { StringHelper } from "@alice-utils/helpers/StringHelper";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { GuildEmoji, GuildMember, MessageEmbed, Snowflake } from "discord.js";

export const run: Subcommand["run"] = async (client, interaction) => {
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
            playerInfo = await dbManager.getFromUid(uid!);
            break;
        case !!username:
            playerInfo = await dbManager.getFromUsername(username!);
            break;
        case !!discordid:
            playerInfo = await dbManager.getFromUser(discordid!);
            break;
        default:
            // If no arguments are specified, default to self
            playerInfo = await dbManager.getFromUser(interaction.user);
    }

    if (!playerInfo) {
        return interaction.editReply({
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

    interaction.editReply({
        embeds: [embed],
    });
};

export const config: Subcommand["config"] = {
    permissions: [],
};
