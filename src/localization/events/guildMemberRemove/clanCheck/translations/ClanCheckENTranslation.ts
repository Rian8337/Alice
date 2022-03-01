import { Translation } from "@alice-localization/base/Translation";
import { ClanCheckStrings } from "../ClanCheckLocalization";

/**
 * The English translation for the `clanCheck` event utility for `guildMemberRemove` event.
 */
export class ClanCheckENTranslation extends Translation<ClanCheckStrings> {
    override readonly translations: ClanCheckStrings = {
        memberKicked:
            "Hey, your member (%s) has left the server, therefore they have been kicked from your clan!",
    };
}
