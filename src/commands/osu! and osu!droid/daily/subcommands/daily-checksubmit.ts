import { DatabaseManager } from "@alice-database/DatabaseManager";
import { PlayerInfoCollectionManager } from "@alice-database/managers/aliceDb/PlayerInfoCollectionManager";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { ChallengeCompletionData } from "@alice-interfaces/challenge/ChallengeCompletionData";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { Collection, Snowflake } from "discord.js";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const challengeID: string = interaction.options.getString("challengeid", true);

    const discordid: Snowflake | undefined = interaction.options.getUser("user")?.id;
    const uid: number | null = interaction.options.getInteger("uid");
    const username: string | null = interaction.options.getString("username");

    if ([discordid, uid, username].filter(Boolean).length > 1) {
        return interaction.editReply({
            content: MessageCreator.createReject(dailyStrings.tooManyOptions)
        });
    }

    const dbManager: PlayerInfoCollectionManager = DatabaseManager.aliceDb.collections.playerInfo;

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

    const challenges: Collection<string, ChallengeCompletionData> = playerInfo?.challenges ?? new Collection();

    const completionData: ChallengeCompletionData | undefined = challenges.get(challengeID);

    if (completionData) {
        interaction.editReply({
            content: MessageCreator.createAccept(
                dailyStrings.userHasPlayedChallenge,
                challengeID,
                completionData.highestLevel.toString()
            )
        });
    } else {
        interaction.editReply({
            content: MessageCreator.createAccept(
                dailyStrings.userHasNotPlayedChallenge,
                challengeID
            )
        });
    }
};

export const config: Subcommand["config"] = {
    permissions: []
};