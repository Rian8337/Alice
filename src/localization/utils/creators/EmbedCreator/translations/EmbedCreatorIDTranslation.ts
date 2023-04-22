import { Translation } from "@alice-localization/base/Translation";
import { chatInputApplicationCommandMention, userMention } from "discord.js";
import { EmbedCreatorStrings } from "../EmbedCreatorLocalization";

/**
 * The Indonesian translation for the `EmbedCreator` creator utility.
 */
export class EmbedCreatorIDTranslation extends Translation<EmbedCreatorStrings> {
    override readonly translations: EmbedCreatorStrings = {
        beatmapObjects: "Jumlah Objek",
        beatmapDroidStatistics: "Statistik osu!droid",
        beatmapOsuStatistics: "Statistik osu!",
        beatmapGeneralStatistics: "Statistik Umum",
        exitMenu: 'Ketik "exit" untuk keluar dari menu',
        result: "Hasil",
        droidPP: "Droid PP",
        pcPP: "PC pp",
        estimated: "estimasi",
        droidStars: "droid star",
        pcStars: "PC star",
        starRating: "Star Rating",
        rebalanceCalculationNote:
            "Hasil perhitungan dapat berubah seiring waktu.",
        oldCalculationNote:
            "Hasil perhitungan droid pp berasal dari sistem lama.",
        beatmapInfo: "Informasi Beatmap",
        dateAchieved: "Dicapai pada %s",
        penalties: "Penalti",
        threeFinger: "tiga jari",
        sliderCheese: "",
        forFC: "untuk FC %s",
        sliderTicks: "slider tick",
        sliderEnds: "slider end",
        hitErrorAvg: "rata-rata hit error",
        challengeId: "ID tantangan",
        timeLeft: "Sisa waktu",
        weeklyChallengeTitle: "Tantangan Mingguan osu!droid",
        dailyChallengeTitle: "Tantangan Harian osu!droid",
        featuredPerson: "Diberikan oleh %s",
        download: "Unduh",
        points: "Poin",
        passCondition: "Kondisi Lolos",
        constrain: "Batasan Mod",
        modOnly: "Hanya mod %s",
        rankableMods: "Semua mod ranked selain EZ, NF, dan HT",
        challengeBonuses: `Gunakan ${chatInputApplicationCommandMention(
            "daily",
            "bonuses",
            "889506666498895942"
        )} untuk mengecek bonus.`,
        auctionInfo: "Informasi Lelangan",
        auctionName: "Nama",
        auctionAuctioneer: "Pelelang",
        creationDate: "Tanggal Dibuat",
        auctionMinimumBid: "Jumlah Tawaran Minimum",
        auctionItemInfo: "Informasi Barang",
        auctionPowerup: "Powerup",
        auctionItemAmount: "Jumlah",
        auctionBidInfo: "Informasi Tawaran",
        auctionBidders: "Jumlah Penawar",
        auctionTopBidders: "Penawar Teratas",
        broadcast: "Siaran",
        broadcast1: `Apabila kamu melihat pengguna yang melanggar peraturan, bertingkah laku tidak benar, atau mencoba memberi kekesalan secara sengaja, mohon laporkan pengguna tersebut menggunakan perintah ${chatInputApplicationCommandMention(
            "report",
            "937926296560869466"
        )} (informasi lebih dapat diakses menggunakan perintah \`/help report\`).`,
        broadcast2:
            "Perlu diingat bahwa hanya anggota staff yang dapat melihat laporan, sehingga privasimu akan terjaga. Kami menghargai kontribusimu dalam membawa lingkungan yang bersahabat!",
        mapShareSubmission: "Pengajuan dari %s",
        mapShareStatusAndSummary: "Status dan Ringkasan",
        mapShareStatus: "Stats",
        mapShareSummary: "Ringkasan",
        mapShareStatusAccepted: "iterima",
        mapShareStatusDenied: "ditolak",
        mapShareStatusPending: "sedang diproses",
        mapShareStatusPosted: "telah diposting",
        musicYoutubeChannel: "Channel",
        musicDuration: "Durasi",
        musicQueuer: "Dimasukkan oleh %s",
        ppProfileTitle: "Profil PP untuk %s",
        oldPpProfileTitle: "Profil PP lama untuk %s",
        totalPP: "Total PP",
        ppProfile: "Profil PP",
        warningInfo: "Info Peringatan",
        warningId: "ID Peringatan",
        warnedUser: "Pengguna yang Diingatkan",
        warningIssuedBy: `Diberikan oleh ${userMention("%s")} (%s)`,
        expirationDate: "Tanggal Kadaluarsa",
        reason: "Alasan",
        channel: "Channel",
        recommendedStarRating: "Rekomendasi Star Rating",
        none: "",
    };
}
