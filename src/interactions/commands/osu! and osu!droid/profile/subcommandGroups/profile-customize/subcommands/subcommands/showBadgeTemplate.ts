import { DatabaseManager } from "@database/DatabaseManager";
import { SlashSubcommand } from "structures/core/SlashSubcommand";
import { Constants } from "@core/Constants";
import { MessageCreator } from "@utils/creators/MessageCreator";
import { ProfileManager } from "@utils/managers/ProfileManager";
import { UserBind } from "@database/utils/elainaDb/UserBind";
import { Language } from "@localization/base/Language";
import { CommandHelper } from "@utils/helpers/CommandHelper";
import { ConstantsLocalization } from "@localization/core/constants/ConstantsLocalization";
import { InteractionHelper } from "@utils/helpers/InteractionHelper";
import { ProfileLocalization } from "@localization/interactions/commands/osu! and osu!droid/profile/ProfileLocalization";

export const run: SlashSubcommand<false>["run"] = async (_, interaction) => {
    const language: Language = CommandHelper.getLocale(interaction);

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                    clan: 1,
                },
            },
        );

    if (!bindInfo) {
        return InteractionHelper.update(interaction, {
            content: MessageCreator.createReject(
                new ConstantsLocalization(language).getTranslation(
                    Constants.selfNotBindedReject,
                ),
            ),
        });
    }

    await InteractionHelper.deferUpdate(interaction);

    const template: Buffer | null = await ProfileManager.getProfileTemplate(
        bindInfo.uid,
        bindInfo,
        undefined,
        language,
    );

    if (!template) {
        return InteractionHelper.update(interaction, {
            content: new ProfileLocalization(language).getTranslation(
                "selfProfileNotFound",
            ),
        });
    }

    InteractionHelper.update(interaction, { files: [template] });
};
