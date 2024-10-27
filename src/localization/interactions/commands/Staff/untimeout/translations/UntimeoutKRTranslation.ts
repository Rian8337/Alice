import { Translation } from "@localization/base/Translation";
import { UntimeoutStrings } from "../UntimeoutLocalization";

/**
 * The Korean translation for the `untimeout` command.
 */
export class UntimeoutKRTranslation extends Translation<UntimeoutStrings> {
    override readonly translations: UntimeoutStrings = {
        userCannotUntimeoutError:
            "죄송해요, 당신은 유저의 타임아웃을 해제할 권한이 없어요.",
        untimeoutFailed:
            "죄송해요, 해당 유저의 타임아웃을 해제할 수 없었어요: %s.",
        untimeoutSuccessful: "성공적으로 해당 유저의 타임아웃을 해제했어요.",
    };
}
