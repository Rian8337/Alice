import { Translation } from "@alice-localization/base/Translation";
import { ShowRecentPlaysStrings } from "../ShowRecentPlaysLocalization";

/**
 * The Korean translation for the `showRecentPlays` button command.
 */
export class ShowRecentPlaysKRTranslation extends Translation<ShowRecentPlaysStrings> {
    override readonly translations: ShowRecentPlaysStrings = {
        userNotBinded: "",
        profileNotFound: "죄송해요, 당신의 프로필을 찾을 수 없었어요!",
    };
}
