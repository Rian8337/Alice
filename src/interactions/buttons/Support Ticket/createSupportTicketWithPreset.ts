import { DatabaseManager } from "@database/DatabaseManager";
import { CreateSupportTicketWithPresetLocalization } from "@localization/interactions/buttons/Support Ticket/createSupportTicketWithPreset/CreateSupportTicketWithPresetLocalization";
import { ButtonCommand } from "@structures/core/ButtonCommand";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { SelectMenuCreator } from "@utils/creators/SelectMenuCreator";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const dbManager = DatabaseManager.aliceDb.collections.supportTicketPreset;
    const language = CommandHelper.getLocale(interaction);
    const localization = new CreateSupportTicketWithPresetLocalization(
        language,
    );

    await InteractionHelper.deferReply(interaction);

    const ticketPresetsSearch = await dbManager.get(
        "id",
        {},
        { projection: { _id: 0, id: 1, name: 1 } },
    );

    if (ticketPresetsSearch.size === 0) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("noTicketPresetsExist"),
            ),
        });
    }

    const selectMenuInteraction =
        await SelectMenuCreator.createStringSelectMenu(
            interaction,
            {
                content: MessageCreator.createWarn(
                    localization.getTranslation("selectPresetPrompt"),
                ),
            },
            ticketPresetsSearch.map((v) => {
                return {
                    value: v.id.toString(),
                    label: v.name,
                };
            }),
            [interaction.user.id],
            60,
        );

    if (!selectMenuInteraction) {
        return;
    }

    const preset = await dbManager.getOne({
        id: parseInt(selectMenuInteraction.values[0]),
    });
    if (!preset) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("presetNotFound"),
            ),
        });
    }

    await preset.createProcessor().process(selectMenuInteraction, preset);

    // Delete the left-over select menu, which is a reply to the original interaction.
    await interaction.deleteReply();
};

export const config: ButtonCommand["config"] = {
    cooldown: 300,
    replyEphemeral: true,
};
