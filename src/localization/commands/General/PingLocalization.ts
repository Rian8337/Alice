import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface PingStrings {
    readonly pong: string;
    readonly discordWs: string;
    readonly droidServer: string;
    readonly elainaDb: string;
    readonly aliceDb: string;
}

/**
 * Localizations for the `ping` command.
 */
export class PingLocalization extends Localization<PingStrings> {
    protected override readonly translations: Readonly<
        Translation<PingStrings>
    > = {
        en: {
            pong: "Pong!",
            discordWs: "Discord Websocket",
            droidServer: "osu!droid Server",
            elainaDb: "Elaina Database",
            aliceDb: "Alice Database",
        },
    };
}
