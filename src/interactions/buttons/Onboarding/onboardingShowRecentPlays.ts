import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { OnboardingShowRecentPlaysLocalization } from "@alice-localization/interactions/buttons/Onboarding/onboardingShowRecentPlays/OnboardingShowRecentPlaysLocalization";
import { ButtonCommand } from "@alice-structures/core/ButtonCommand";
import { MessageCreator } from "@alice-utils/creators/MessageCreator";
import { CommandHelper } from "@alice-utils/helpers/CommandHelper";
import { InteractionHelper } from "@alice-utils/helpers/InteractionHelper";
import { ScoreDisplayHelper } from "@alice-utils/helpers/ScoreDisplayHelper";
import { Player } from "@rian8337/osu-droid-utilities";

export const run: ButtonCommand["run"] = async (_, interaction) => {
    const localization: OnboardingShowRecentPlaysLocalization =
        new OnboardingShowRecentPlaysLocalization(
            await CommandHelper.getLocale(interaction)
        );

    const bindInfo: UserBind | null =
        await DatabaseManager.elainaDb.collections.userBind.getFromUser(
            interaction.user,
            {
                projection: {
                    _id: 0,
                    uid: 1,
                },
            }
        );

    if (!bindInfo) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("userNotBinded")
            ),
        });
    }

    await InteractionHelper.deferReply(interaction);

    const player: Player | null = await Player.getInformation(bindInfo.uid);

    if (!player) {
        return InteractionHelper.reply(interaction, {
            content: MessageCreator.createReject(
                localization.getTranslation("profileNotFound")
            ),
        });
    }

    ScoreDisplayHelper.showRecentPlays(interaction, player);
};

export const config: ButtonCommand["config"] = {
    replyEphemeral: true,
};
