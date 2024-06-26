import { Constants } from "@alice-core/Constants";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { Clan } from "@alice-database/utils/elainaDb/Clan";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OperationResult } from "structures/core/OperationResult";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { ClanLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/clan/ClanLocalization";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { MessageButtonCreator } from "@alice-utils/creators/MessageButtonCreator";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { PermissionHelper } from "@alice-utils/helpers/PermissionHelper";
import { Collection, GuildMember, Snowflake } from "discord.js";

export const run: SlashSubcommand<true>["run"] = async (
    client,
    interaction,
) => {
    const localization: ClanLocalization = new ClanLocalization(
        CommandHelper.getLocale(interaction),
    );

    let clanName: string;

    const allowedConfirmations: Snowflake[] = [];

    if (interaction.options.getString("name")) {
        const staffMembers: Collection<Snowflake, GuildMember> =
            await PermissionHelper.getMainGuildStaffMembers(client);

        if (!staffMembers.has(interaction.user.id)) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation(
                        "selfHasNoAdministrativePermission",
                    ),
                ),
            });
        }

        allowedConfirmations.push(...staffMembers.keys());

        clanName = interaction.options.getString("name", true);
    } else {
        const bindInfo: UserBind | null =
            await DatabaseManager.elainaDb.collections.userBind.getFromUser(
                interaction.user,
                {
                    projection: {
                        _id: 0,
                        clan: 1,
                    },
                },
            );

        if (!bindInfo) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    new ConstantsLocalization(
                        localization.language,
                    ).getTranslation(Constants.selfNotBindedReject),
                ),
            });
        }

        if (!bindInfo.clan) {
            return InteractionHelper.reply(interaction, {
                content: MessageCreator.createReject(
                    localization.getTranslation("selfIsNotInClan"),
                ),
            });
        }

        clanName = bindInfo.clan;
    }

    const clan: Clan | null =
        await DatabaseManager.elainaDb.collections.clan.getFromName(clanName);

    if (!clan) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clanDoesntExist"),
            ),
        });
    }

    if (
        !clan.hasAdministrativePower(interaction.user) &&
        allowedConfirmations.length === 1
    ) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation(
                    "selfHasNoAdministrativePermission",
                ),
            ),
        });
    }

    const confirmation: boolean = await MessageButtonCreator.createConfirmation(
        interaction,
        {
            content: MessageCreator.createWarn(
                localization.getTranslation("clearDescriptionConfirmation"),
            ),
        },
        [interaction.user.id],
        20,
        localization.language,
    );

    if (!confirmation) {
        return;
    }

    const editDescResult: OperationResult = clan.setDescription(
        undefined,
        localization.language,
    );

    if (!editDescResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clearDescriptionFailed"),
                editDescResult.reason!,
            ),
        });
    }

    const finalResult: OperationResult = await clan.updateClan();

    if (!finalResult.success) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("clearDescriptionFailed"),
                finalResult.reason!,
            ),
        });
    }

    InteractionHelper.reply(interaction, {
        content: MessageCreator.createAccept(
            localization.getTranslation("clearDescriptionSuccessful"),
        ),
    });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
