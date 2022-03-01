import { Localization } from "@alice-localization/base/Localization";
import { Translations } from "@alice-localization/base/Translations";
import { MathgameENTranslation } from "./translations/MathgameENTranslation";
import { MathgameIDTranslation } from "./translations/MathgameIDTranslation";
import { MathgameKRTranslation } from "./translations/MathgameKRTranslation";

export interface MathgameStrings {
    readonly userHasOngoingGame: string;
    readonly channelHasOngoingGame: string;
    readonly gameStartedNotification: string;
    readonly couldNotFetchEquationGameEnd: string;
    readonly noAnswerGameEnd: string;
    readonly singleGamemodeQuestion: string;
    readonly multiGamemodeQuestion: string;
    readonly correctAnswer: string;
    readonly gameStatistics: string;
    readonly gameStarter: string;
    readonly timeStarted: string;
    readonly duration: string;
    readonly levelReached: string;
    readonly operatorCount: string;
    readonly level: string;
    readonly totalCorrectAnswers: string;
    readonly answers: string;
}

/**
 * Localizations for the `mathgame` command.
 */
export class MathgameLocalization extends Localization<MathgameStrings> {
    protected override readonly localizations: Readonly<
        Translations<MathgameStrings>
    > = {
        en: new MathgameENTranslation(),
        kr: new MathgameKRTranslation(),
        id: new MathgameIDTranslation(),
    };
}
