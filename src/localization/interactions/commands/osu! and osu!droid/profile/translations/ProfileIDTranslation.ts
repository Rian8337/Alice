import { Translation } from "@alice-localization/base/Translation";
import { ProfileStrings } from "../ProfileLocalization";

/**
 * The Indonesian translation for the `profile` command.
 */
export class ProfileIDTranslation extends Translation<ProfileStrings> {
    override readonly translations: ProfileStrings = {
        tooManyOptions:
            "Maaf, kamu hanya dapat memasukkan uid, pengguna, atau username! Kamu tidak dapat menggabung mereka!",
        selfProfileNotFound: "Maaf, aku tidak dapat menemukan profilmu!",
        userProfileNotFound:
            "Maaf, aku tidak dapat menemukan profile pemain tersebut!",
        viewingProfile: "Profil osu!droid untuk [%s](<%s>):",
        invalidRGBAformat: "Maaf, format warna RGBA tersebut tidak benar!",
        invalidHexCode: "Maaf, format warna hex tersebut tidak benar!",
        changeInfoTextColorConfirmation:
            "%s, apakah kamu ingin mengganti warna teks kotak deskripsi di gambar profilmu ke `%s`?",
        changeInfoBackgroundColorConfirmation:
            "%s, apakah kamu ingin mengganti warna latar belakang kotak deskripsi di gambar profilmu ke `%s`?",
        changeInfoTextColorSuccess:
            "%s, berhasil mengganti warna teks kotak deskripsi di gambar profilmu ke `%s`.",
        changeInfoBackgroundColorSuccess:
            "%s, berhasil mengganti warna latar belakang kotak deskripsi di gambar profilmu ke `%s`.",
        coinsToBuyBackgroundNotEnough:
            "Maaf, kamu tidak memiliki %skoin Alice yang cukup untuk melakukan aksi ini! Sebuah latar belakang memiliki harga %s`500` koin Alice. Kamu memiliki %s`%s` koin Alice.",
        buyBackgroundConfirmation:
            "%s, kamu belum memiliki latar belakang ini! Apakah kamu ingin membeli latar belakang ini dengan harga %s`500` koin Alice dan mengganti latar belakang gambar profilmu?",
        switchBackgroundConfirmation:
            "%s, apakah kamu ingin mengganti latar belakang gambar profilmu?",
        switchBackgroundSuccess:
            "%s, berhasil menggant latar belakang gambar profilmu ke `%s`.",
        aliceCoinAmount: "Kamu memiliki %s`%s` koin Alice.",
        userDoesntOwnAnyBadge: "Maaf, kamu tidak memiliki lencana apapun!",
        badgeIsAlreadyClaimed: "Maaf, kamu telah mengambil lencana ini!",
        equipBadgeSuccess: "%s, berhasil memakai lencana `%s` di slot %s",
        unequipBadgeSuccess: "%s, berhasil melepas lencana di slot %s.",
        badgeUnclaimable: "Maaf, lencana ini tidak dapat diambil!",
        beatmapToClaimBadgeNotValid:
            "Hei, mohon berikan tautan atau ID beatmap yang benar!",
        beatmapToClaimBadgeNotFound:
            "Maaf, aku tidak dapat menemukan beatmap yang kamu berikan!",
        beatmapToClaimBadgeNotRankedOrApproved:
            "Maaf, kamu hanya dapat memberikan beatmap ranked/approved!",
        userDoesntHaveScoreinBeatmap:
            "Maaf, kamu tidak memiliki skor di beatmap ini!",
        userCannotClaimBadge:
            "Maaf, kamu tidak memenuhi syarat untuk mengambil lencana ini!",
        claimBadgeSuccess: "%s, berhasil mengambil lencana `%s`.",
        userNotBindedToAccount:
            "Maaf, uid tersebut tidak terhubung dengan akun Discordmu!",
        playerCredentialsNotFound:
            "Maaf, aku tidak bisa menemukan kredensial uid tersebut!",
        chooseBackground: "Pilih latar belakang yang ingin kamu gunakan.",
        changeInfoBoxBackgroundColorTitle:
            "Ubah Warna Latar Belakang Kotak Informasi",
        enterColor: "Berikan warna yang ingin kamu gunakan.",
        supportedColorFormat:
            "Warna yang diberikan bisa dalam format RGBA (contoh: 255,0,0,1) atau kode hex (contoh: #008BFF).",
        changeInfoBoxTextColorTitle: "Ubah Warna Teks Kotak Informasi",
        chooseClaimBadge: "Pilih lencana yang ingin kamu ambil.",
        claimBadge: "Ambil Lencana Profil",
        enterBeatmap:
            "Berikan tautan atau ID beatmap dengan star rating minimal %s%s di PC. Kamu juga harus memiliki skor full combo di beatmapnya.",
        enterBeatmapRestriction:
            "Beatmap yang diberikan harus berada dalam status ranked/approved.",
        chooseEquipBadge: "Pilih lencana yang ingin kamu gunakan.",
        chooseBadgeSlot:
            "Pilih nomor slot untuk lencana yang ingin kamu gunakan.",
        owned: "Dimiliki",
        droidPpBadgeDescription: "Dihargai karena mencapai %s droid pp",
        totalScoreBadgeDescription: "Dihargai karena mencapai %s skor total",
        rankedScoreBadgeDescription: "Dihargai karena mencapai %s skor ranked",
        beatmapFcBadgeDescription:
            "Dihargai karena mendapatkan skor full combo di beatmap ranked/approved %s%s",
        tournamentBadgeDescription:
            "Dihargai karena memenangkan turnamen Discord osu!droid iterasi ke-%s",
        unequipBadge: "Pilih nomor slot untuk lencana yang ingin kamu lepas.",
        infoBoxTextColorInfo:
            "Warna RGBA/hex teks di kotak informasimu adalah %s.",
        infoBoxBackgroundColorInfo:
            "Warna RGBA/hex latar belakang di kotak informasimu adalah %s.",
        changeBackgroundLabel: "Ganti Latar Belakang",
        changeBackgroundDescription: "Ubah latar belakang kartu profilmu.",
        listBackgroundLabel: "Daftar Latar Belakang",
        listBackgroundDescription:
            "Tampilkan daftar latar belakang yang tersedia, termasuk yang sudah kamu miliki.",
        customizationPlaceholder: "Pilih poin yang ingin kamu ubah.",
        showBadgeTemplateLabel: "Tampilkan Templat Lencana",
        showBadgeTemplateDescription:
            "Tampilkan templat lencana di sebuah kartu profil.",
        claimBadgeLabel: "Ambil Lencana",
        claimBadgeDescription: "Ambil sebuah lencana.",
        equipBadgeLabel: "Gunakan Lencana",
        equipBadgeDescription: "Gunakan sebuah lencana.",
        unequipBadgeLabel: "Lepas Lencana",
        unequipBadgeDescription: "Lepas sebuah lencana.",
        listBadgeLabel: "Daftar Lencana",
        listBadgeDescription:
            "Tampilkan daftar lencana, termasuk yang sudah kamu miliki.",
        viewBackgroundColorLabel: "Tampilkan Warna Latar Belakang",
        viewBackgroundColorDescription:
            "Tampilkan warna latar belakang kotak informasi di kartu profilmu.",
        changeBackgroundColorLabel: "Ubah Warna Latar Belakang",
        changeBackgroundColorDescription:
            "Ubah warna latar belakang kotak informasi di kartu profilmu.",
        viewTextColorLabel: "Tampilkan Warna Teks",
        viewTextColorDescription:
            "Tampilkan warna teks kotak informasi di kartu profilmu.",
        changeTextColorLabel: "Ubah Warna Teks",
        changeTextColorDescription:
            "Ubah warna teks kotak informasi di kartu profilmu.",
        playerBindInfo: "Informasi Pemain untuk %s (klik untuk melihat profil)",
        avatarLink: "Tautan Avatar",
        uid: "Uid",
        rank: "Peringkat",
        playCount: "Jumlah Main",
        country: "Negara",
        bindInformation: "Informasi Hubungan",
        binded: "Terhubung ke <@%s> (ID pengguna: %s)",
        notBinded: "Tidak terhubung",
        playerCredentialsInfo: "",
        username: "Nama Pemain",
        password: "Kata Sandi",
        doNotShareCredentialsWarning:
            "Jangan berikan kredensial ini ke siapapun sebelum kamu mengubah kata sandi kamu.",
        changeCredentialsDirection:
            "Silakan masuk ke [laman ini](%s) menggunakan kredensial ini dan ubah email dan kata sandi kamu.",
    };
}
