import { Translation } from "@localization/base/Translation";
import { ClanAnnounceStrings } from "../ClanAnnounceLocalization";

/**
 * The Korean translation for the `clan-announce` modal command.
 */
export class ClanAnnounceKRTranslation extends Translation<ClanAnnounceStrings> {
    override readonly translations: ClanAnnounceStrings = {
        selfIsNotInClan: "죄송해요, 클랜에 속해있지 않으시네요!",
        selfHasNoAdministrativePermission:
            "죄송해요, 이 행동을 수행하기 위한 클랜에서의 권한이 부족해요.",
        announcementMessageConfirmation:
            "클랜에 안내 메시지를 보내려는게 확실한가요?",
    };
}
