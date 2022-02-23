import { Localization } from "@alice-localization/base/Localization";
import { Translation } from "@alice-localization/base/Translation";

export interface BirthdayStrings {
    readonly selfBirthdayNotExist: string;
    readonly userBirthdayNotExist: string;
    readonly setBirthdayFailed: string;
    readonly setBirthdaySuccess: string;
    readonly birthdayInfo: string;
    readonly date: string;
    readonly timezone: string;
}

/**
 * Localizations for the `birthday` command.
 */
export class BirthdayLocalization extends Localization<BirthdayStrings> {
    protected override readonly translations: Readonly<
        Translation<BirthdayStrings>
    > = {
        en: {
            selfBirthdayNotExist: "I'm sorry, you don't have a birthday!",
            userBirthdayNotExist:
                "I'm sorry, the user doesn't have a birthday!",
            setBirthdayFailed: "I'm sorry, I'm unable to set birthday: %s.",
            setBirthdaySuccess: "Successfully set birthday to %s/%s at UTC%s.",
            birthdayInfo: "Birthday Info for %s",
            date: "Date",
            timezone: "Timezone",
        },
        kr: {
            selfBirthdayNotExist: "죄송해요, 아직 생일을 설정하지 않으셨어요!",
            userBirthdayNotExist:
                "죄송해요, 이 유저는 아직 생일을 설정하지 않았어요!",
            setBirthdayFailed: "죄송해요, %s 로 생일을 설정할 수 없어요.",
            setBirthdaySuccess:
                "성공적으로 생일을 다음과 같이 설정했어요: %s/%s, 시간대 UTC%s.",
            birthdayInfo: "",
            date: "",
            timezone: "",
        },
        id: {
            selfBirthdayNotExist:
                "Maaf, kamu belum mengatur informasi ulang tahunmu!",
            userBirthdayNotExist:
                "Maaf, pengguna tersebut belum mengatur informasi ulang tahunnya!",
            setBirthdayFailed:
                "Maaf, aku tidak bisa mengatur informasi ulang tahun: %s.",
            setBirthdaySuccess:
                "Berhasil mengatur ulang tahun pada tanggal %s/%s di zona waktu UTC%s.",
            birthdayInfo: "Informasi Ulang Tahun untuk %s",
            date: "Tanggal",
            timezone: "Zona Waktu",
        },
    };
}
