import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Challenge } from "@alice-database/utils/aliceDb/Challenge";
import { BonusDescription } from "@alice-interfaces/challenge/BonusDescription";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { ChallengeType } from "@alice-types/challenge/ChallengeType";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { GuildMember, MessageEmbed } from "discord.js";
import { dailyStrings } from "../dailyStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const type: ChallengeType =
        <ChallengeType>interaction.options.getString("type") ?? "daily";

    const challenge: Challenge | null =
        await DatabaseManager.aliceDb.collections.challenge.getOngoingChallenge(
            type
        );

    if (!challenge) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                dailyStrings.noOngoingChallenge
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember>interaction.member).displayColor,
    });

    const bonusDescription: BonusDescription[] =
        challenge.getBonusInformation();

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: BonusDescription[]
    ) => {
        const content: BonusDescription = contents[page - 1];

        embed.addField(content.id, content.description);
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        bonusDescription,
        1,
        1,
        60,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
