import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { NameChange } from "@alice-database/utils/aliceDb/NameChange";
import { Subcommand } from "@alice-interfaces/core/Subcommand";
import { OnButtonPageChange } from "@alice-interfaces/utils/OnButtonPageChange";
import { EmbedCreator } from "@alice-utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { NumberHelper } from "@alice-utils/helpers/NumberHelper";
import { GuildMember, MessageEmbed } from "discord.js";
import { namechangeStrings } from "../namechangeStrings";

export const run: Subcommand["run"] = async (_, interaction) => {
    const uid: number = interaction.options.getInteger("uid", true);

    if (
        !NumberHelper.isNumberInRange(
            uid,
            Constants.uidMinLimit,
            Constants.uidMaxLimit
        )
    ) {
        return interaction.editReply({
            content: MessageCreator.createReject(namechangeStrings.invalidUid),
        });
    }

    const nameChange: NameChange | null =
        await DatabaseManager.aliceDb.collections.nameChange.getFromUid(uid);

    if (!nameChange) {
        return interaction.editReply({
            content: MessageCreator.createReject(
                namechangeStrings.userHasNoHistory
            ),
        });
    }

    const embed: MessageEmbed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: (<GuildMember | null>interaction.member)?.displayColor,
    });

    embed
        .setTitle(`Name History For Uid ${nameChange.uid}`)
        .setDescription(`**Current Username**: ${nameChange.current_username}`);

    const onPageChange: OnButtonPageChange = async (
        _,
        page,
        contents: string[]
    ) => {
        embed.addField(
            "Name History",
            contents
                .slice(10 * (page - 1), 10 + 10 * (page - 1))
                .map((v, i) => `**${10 * (page - 1) + i}.** ${v}`)
                .join("\n")
        );
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        nameChange.previous_usernames,
        10,
        1,
        120,
        onPageChange
    );
};

export const config: Subcommand["config"] = {
    permissions: [],
};
