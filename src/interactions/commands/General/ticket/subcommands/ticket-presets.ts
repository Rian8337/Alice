import { DatabaseManager } from "@database/DatabaseManager";
import { TicketLocalization } from "@localization/interactions/commands/General/ticket/TicketLocalization";
import { SlashSubcommand } from "@structures/core/SlashSubcommand";
import { OnButtonPageChange } from "@structures/utils/OnButtonPageChange";
import { EmbedCreator } from "@utils/creators/EmbedCreator";
import { MessageButtonCreator } from "@utils/creators/MessageButtonCreator";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { bold } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (_, interaction) => {
    if (!interaction.inCachedGuild()) {
        return;
    }

    const localization = new TicketLocalization(
        CommandHelper.getLocale(interaction),
    );

    await InteractionHelper.deferReply(interaction);

    const presets =
        await DatabaseManager.aliceDb.collections.supportTicketPreset.get(
            "id",
            {},
            { projection: { _id: 0, id: 1, name: 1 } },
        );

    if (presets.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTicketPresetsExist"),
            ),
        });
    }

    const presetsArray = [...presets.values()];
    const presetsPerPage = 5;
    const embed = EmbedCreator.createNormalEmbed({
        author: interaction.user,
        color: interaction.member.displayColor,
    });

    embed.setTitle(localization.getTranslation("ticketPresetListEmbedTitle"));

    const onPageChange: OnButtonPageChange = async (_, page) => {
        const presets = presetsArray.slice(
            presetsPerPage * (page - 1),
            presetsPerPage * page,
        );

        const presetDescriptions: string[] = [];

        for (let i = 0; i < presets.length; ++i) {
            const preset = presets[i];

            presetDescriptions.push(
                `${bold("ID")}: ${preset.id}\n${preset.name}`,
            );
        }

        embed.setDescription(presetDescriptions.join("\n\n"));
    };

    MessageButtonCreator.createLimitedButtonBasedPaging(
        interaction,
        { embeds: [embed] },
        [interaction.user.id],
        1,
        Math.ceil(presets.size / presetsPerPage),
        90,
        onPageChange,
    );
};
