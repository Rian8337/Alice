import { Translation } from "@localization/base/Translation";
import { PingStrings } from "../PingLocalization";

/**
 * The Korean translation for the `ping` command.
 */
export class PingKRTranslation extends Translation<PingStrings> {
    override readonly translations: PingStrings = {
        pong: "Pong!",
        discordWs: "디스코드 웹소켓",
        droidServer: "osu!droid 서버",
        elainaDb: "Elaina 데이터베이스",
        aliceDb: "Alice 데이터베이스",
    };
}
