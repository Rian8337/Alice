import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { BeatmapManager } from "@alice-utils/managers/BeatmapManager";
import { GuildMember, MessageEmbed } from "discord.js";
import { Player, Score } from "osu-droid";
import { compareStrings } from "../compareStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const cachedBeatmapHash: string = BeatmapManager.getChannelLatestBeatmap(interaction.channel!.id)!;

    const bindInfo: UserBind | null = await DatabaseManager.elainaDb.collections.userBind.getFromUser(interaction.user);

    if (!bindInfo) {
        return interaction.editReply({
            content: MessageCreator.createReject(Constants.selfNotBindedReject)
        });
    }

    const player: Player = await Player.getInformation({ uid: bindInfo.uid });

    if (!player.username) {
        return interaction.editReply({
            content: MessageCreator.createReject(compareStrings.playerNotFound)
        });
    }

    const score: Score = await Score.getFromHash({ uid: player.uid, hash: cachedBeatmapHash });

    if (!score.title) {
        return interaction.editReply({
            content: MessageCreator.createReject(compareStrings.scoreNotFound)
        });
    }

    const embed: MessageEmbed = await EmbedCreator.createRecentPlayEmbed(
        score,
        player.avatarURL,
        (<GuildMember> interaction.member).displayColor
    );

    interaction.editReply({
        content: MessageCreator.createAccept(compareStrings.comparePlayDisplay, player.username),
        embeds: [ embed ]
    });
};

export const config: Subcommand["config"] = {
    permissions: []
};