import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface MapsearchStrings {
    readonly requestFailed: string;
    readonly noBeatmapsFound: string;
    readonly serviceProvider: string;
    readonly beatmapsFound: string;
    readonly download: string;
}

/**
 * Localizations for the `mapsearch` command.
 */
export class MapsearchLocalization extends Localization<MapsearchStrings> {
    protected override readonly translations: Readonly<
        Translation<MapsearchStrings>
    > = {
            en: {
                requestFailed:
                    "I'm sorry, I couldn't fetch your beatmap search result from Sayobot!",
                noBeatmapsFound:
                    "I'm sorry, your beatmap search doesn't return any beatmaps!",
                serviceProvider: "Service provided by Sayobot",
                beatmapsFound: "Beatmaps Found",
                download: "Download",
            },
        };
}
