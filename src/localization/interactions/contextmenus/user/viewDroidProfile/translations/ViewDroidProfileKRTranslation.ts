import { Translation } from "@alice-localization/base/Translation";
import { ViewDroidProfileStrings } from "../ViewDroidProfileLocalization";

/**
 * The Korean translation for the `viewDroidProfile` user context menu command.
 */
export class ViewDroidProfileKRTranslation extends Translation<ViewDroidProfileStrings> {
    override readonly translations: ViewDroidProfileStrings = {
        selfProfileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
        userProfileNotFound: "죄송해요, 그 유저의 프로필을 찾을 수 없었어요!",
        viewingProfile: "%s의 osu!droid 프로필:\n<%s>",
    };
}
