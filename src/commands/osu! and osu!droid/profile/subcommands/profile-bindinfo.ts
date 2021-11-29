import { GuildMember, MessageEmbed, Snowflake } from "discord.js";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { profileStrings } from "../profileStrings";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { UserBindCollectionManager } from "@alice-database/managers/elainaDb/UserBindCollectionManager";
import { Player } from "osu-droid";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";

export const run: Subcommand["run"] = async (_, interaction) => {
    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(profileStrings.tooManyOptions)
        });
    }

    const dbManager: UserBindCollectionManager = DatabaseManager.elainaDb.collections.userBind;

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
                profileStrings.profileNotFound, "the player's"
            )
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed(
        { color: (<GuildMember | null>interaction.member)?.displayColor }
    );

    embed.setAuthor(`Player Information for ${player.username} (click to view profile)`, interaction.user.avatarURL({ dynamic: true })!, `http://ops.dgsrz.com/profile.php?uid=${player.uid}`)
        .setThumbnail(player.avatarURL)
        .setDescription(
            `[Avatar Link](${player.avatarURL})\n\n` +
            `**Uid**: ${player.uid}\n` +
            `**Rank**: ${player.rank.toLocaleString()}\n` +
            `**Play Count**: ${player.playCount.toLocaleString()}\n` +
            `**Country**: ${player.location}\n\n` +
            `**Bind Information**: ${bindInfo ? `Binded to <@${bindInfo.discordid}> (user ID: ${bindInfo.discordid})` : "Not binded"}`
        );

    interaction.editReply({
        embeds: [embed]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};