import { DatabaseManager } from "@alice-database/DatabaseManager";
import { SlashSubcommand } from "@alice-interfaces/core/SlashSubcommand";
import { Constants } from "@alice-core/Constants";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { ProfileManager } from "@alice-utils/managers/ProfileManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { Language } from "@alice-localization/base/Language";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@alice-localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ProfileLocalization } from "@alice-localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const language: Language = await CommandHelper.getLocale(interaction);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user
        );

    if (!bindInfo) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.selfNotBindedReject
                )
            ),
        });
    }

    await InteractionHelper.deferUpdate(interaction);

    const template: Buffer | null = await ProfileManager.getProfileTemplate(
        bindInfo.uid,
        bindInfo,
        undefined,
        language
    );

    if (!template) {
        return InteractionHelper.update(interaction, {
            content: new ProfileLocalization(language).getTranslation(
                "selfProfileNotFound"
            ),
        });
    }

    InteractionHelper.update(interaction, { files: [template] });
};

export const config: SlashSubcommand["config"] = {
    permissions: [],
};
