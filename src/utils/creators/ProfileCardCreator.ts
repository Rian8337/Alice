import {
    Canvas,
    createCanvas,
    Image,
    loadImage,
    NodeCanvasRenderingContext2D,
} from "canvas";
import { Player } from "osu-droid";
import { promises, Stats } from "fs";
import { PPEntry } from "@alice-interfaces/dpp/PPEntry";
import { DatabaseManager } from "@alice-database/DatabaseManager";
import { UserBind } from "@alice-database/utils/elainaDb/UserBind";
import { RankedScore } from "@alice-database/utils/aliceDb/RankedScore";
import { PlayerInfo } from "@alice-database/utils/aliceDb/PlayerInfo";
import { PartialProfileBackground } from "@alice-interfaces/profile/PartialProfileBackground";

/**
 * A utility to create profile cards.
 */
export class ProfileCardCreator {
    /**
     * The player.
     */
    private readonly player: Player;

    /**
     * Whether to show detailed statistics in the profile card.
     */
    private readonly detailed: boolean;

    /**
     * The bind information of the player.
     */
    private readonly bindInfo?: UserBind | null;

    /**
     * The ranked score information of the player.
     */
    private readonly rankedScoreInfo?: RankedScore | null;

    /**
     * Information about the binded Discord account of the player.
     */
    private readonly playerInfo?: PlayerInfo | null;

    /**
     * The canvas that will be used to draw.
     */
    private canvas: Canvas;

    /**
     * The canvas context that will be used to draw.
     */
    private get context(): NodeCanvasRenderingContext2D {
        return this.canvas.getContext("2d");
    }

    /**
     * Whether to draw for template badges.
     */
    private template: boolean = false;

    /**
     * @param player The player to draw.
     * @param detailed Whether to show detailed statistics in the profile card.
     * @param bindInfo The bind information of the player.
     * @param rankedScoreInfo The ranked score information of the player.
     * @param playerInfo Information about the binded Discord account of the player.
     */
    constructor(
        player: Player,
        detailed: boolean,
        bindInfo?: UserBind | null,
        rankedScoreInfo?: RankedScore | null,
        playerInfo?: PlayerInfo | null
    ) {
        this.player = player;
        this.detailed = detailed;
        this.bindInfo = bindInfo;
        this.rankedScoreInfo = rankedScoreInfo;
        this.playerInfo = playerInfo;

        this.canvas = createCanvas(500, this.detailed ? 500 : 200);
    }

    /**
     * Generates the template card of the player.
     */
    async generateTemplateCard(): Promise<Buffer> {
        this.template = true;

        const card: Buffer = await this.generateCard();

        this.template = false;

        return card;
    }

    /**
     * Generates the profile card of the player.
     */
    async generateCard(): Promise<Buffer> {
        this.resetCanvas();

        await this.drawBackground();
        await this.drawUserProfile();
        await this.drawDescriptionBox();

        return this.canvas.toBuffer();
    }

    /**
     * Resets the current canvas by creating a new one.
     */
    private resetCanvas(): void {
        this.canvas = createCanvas(
            500,
            this.detailed || this.template ? 500 : 200
        );
    }

    /**
     * Draws profile background to the current canvas context.
     */
    private async drawBackground(): Promise<void> {
        this.context.save();

        const backgroundImageID: string =
            this.playerInfo?.picture_config.activeBackground.id ?? "bg";
        const bg: Image = await loadImage(
            `${process.cwd()}/files/images/backgrounds/${backgroundImageID}.png`
        );
        this.context.drawImage(bg, 0, 0);

        this.context.restore();
    }

    /**
     * Draws the user profile area of the profile card.
     */
    private async drawUserProfile(): Promise<void> {
        this.initUserProfile();
        await this.drawPlayerAvatar();
        await this.drawFlag();
        this.drawPlayerRank();

        if (!this.detailed && !this.template) {
            // Draw player level for detailed or template profile card in description
            // box so that description box's initialization doesn't overlap the drawing.
            this.drawPlayerLevel();
        }

        await this.writePlayerProfile();
    }

    /**
     * Draws the description box area of the profile card.
     */
    private async drawDescriptionBox(): Promise<void> {
        if (!this.detailed && !this.template) {
            return;
        }

        this.initDescriptionBox();
        this.drawPlayerLevel();
        await this.drawAliceCoinsInformation();

        if (this.template) {
            this.drawTemplateBadges();
        } else {
            await this.drawBadges();
        }
    }

    /**
     * Initializes the area where user profile will be drawn.
     */
    private initUserProfile(): void {
        this.context.save();

        this.context.globalAlpha = 0.9;
        this.context.fillStyle = "#bbbbbb";
        this.context.fillRect(164, 9, 327, 185);

        this.context.restore();
    }

    /**
     * Draws the player's avatar to the current canvas context.
     */
    private async drawPlayerAvatar(): Promise<void> {
        this.context.save();

        const avatar: Image = await loadImage(this.player.avatarURL);
        this.context.drawImage(avatar, 9, 9, 150, 150);

        this.context.restore();
    }

    /**
     * Draws the player's flag to the current canvas context.
     */
    private async drawFlag(): Promise<void> {
        this.context.save();

        try {
            const flagPath: string = `${process.cwd()}/files/flags/${
                this.player.location
            }.png`;
            const flagStats: Stats = await promises.stat(flagPath);

            if (flagStats.isFile()) {
                const flagImage: Image = await loadImage(flagPath);
                this.context.drawImage(
                    flagImage,
                    440,
                    15,
                    flagImage.width / 1.5,
                    flagImage.height / 1.5
                );

                this.context.textAlign = "center";
                this.context.textBaseline = "middle";
                this.context.font =
                    this.detailed || this.template ? "18px Exo" : "16px Exo";

                this.context.fillText(
                    this.player.location,
                    440 + flagImage.width / 3,
                    flagImage.height + 15
                );
            }
            // eslint-disable-next-line no-empty
        } catch {}

        this.context.restore();
    }

    /**
     * Draws the player's rank.
     */
    private drawPlayerRank(): void {
        this.context.save();

        this.context.globalAlpha = 0.9;
        this.context.fillStyle = "#cccccc";
        this.context.fillRect(9, 164, 150, 30);

        this.context.globalAlpha = 1;
        this.context.font = "bold 24px Exo";
        switch (true) {
            case this.player.rank === 1:
                this.context.fillStyle = "#0009cd";
                break;
            case this.player.rank <= 10:
                this.context.fillStyle = "#e1b000";
                break;
            case this.player.rank <= 100:
                this.context.fillStyle = "rgba(180, 44, 44, 0.81)";
                break;
            case this.player.rank <= 1000:
                this.context.fillStyle = "#008708";
                break;
            default:
                this.context.fillStyle = "#787878";
        }
        this.context.fillText(`#${this.player.rank.toLocaleString()}`, 12, 187);

        this.context.restore();
    }

    /**
     * Draws the player's ranked score level.
     */
    private drawPlayerLevel(): void {
        this.context.save();

        // Outer box
        this.context.globalAlpha = 0.9;
        this.context.fillStyle = "#cccccc";
        if (this.detailed || this.template) {
            this.context.fillRect(77, 206, 405, 30);
        } else {
            this.context.fillRect(215, 152, 267, 30);
        }

        // Inner box
        this.context.fillStyle = "#979797";
        if (this.detailed || this.template) {
            this.context.fillRect(79, 208, 401, 26);
        } else {
            this.context.fillRect(217, 154, 263, 26);
        }

        this.context.globalAlpha = 1;

        // Level progress
        if (this.rankedScoreInfo) {
            const progress: number =
                this.rankedScoreInfo.level -
                Math.floor(this.rankedScoreInfo.level);
            if (progress > 0) {
                this.context.fillStyle = "#e1c800";
                if (this.detailed || this.template) {
                    this.context.fillRect(79, 208, progress * 401, 26);
                } else {
                    this.context.fillRect(217, 154, progress * 263, 26);
                }
            }
        }

        // Level text
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillStyle =
            this.playerInfo?.picture_config.textColor ?? "#000000";
        const rankedScoreLevel: number = this.rankedScoreInfo?.level ?? 1;
        if (this.detailed || this.template) {
            this.context.font = "19px Exo";
            this.context.fillText(
                `${(
                    (rankedScoreLevel - Math.floor(rankedScoreLevel)) *
                    100
                ).toFixed(2)}%`,
                279.5,
                221
            );
            this.context.fillText(`Lv${Math.floor(rankedScoreLevel)}`, 43, 221);
        } else {
            this.context.font = "16px Exo";
            this.context.fillText(
                `${(
                    (rankedScoreLevel - Math.floor(rankedScoreLevel)) *
                    100
                ).toFixed(2)}%`,
                348.5,
                167
            );
            this.context.fillText(
                `Lv${Math.floor(rankedScoreLevel)}`,
                189.5,
                167
            );
        }

        this.context.restore();
    }

    /**
     * Writes the details of the player's profile.
     */
    private async writePlayerProfile(): Promise<void> {
        this.context.save();

        const x: number = 169;
        const y: number = this.detailed || this.template ? 84 : 50;

        this.context.fillStyle = "#000000";
        this.context.font =
            this.detailed || this.template ? "bold 25px Exo" : "bold 20px Exo";
        this.context.fillText(
            this.player.username,
            x,
            this.detailed || this.template ? 45 : 30,
            243
        );

        let yOffset: number = 0;

        const increaseYOffset: () => void = () => {
            yOffset += this.detailed || this.template ? 20 : 18;
        };

        this.context.font =
            this.detailed || this.template ? "18px Exo" : "16px Exo";
        this.context.fillText(
            `Total Score: ${this.player.score.toLocaleString()}`,
            x,
            y + yOffset
        );
        increaseYOffset();

        if (this.rankedScoreInfo) {
            this.context.fillText(
                `Ranked Score: ${this.rankedScoreInfo.score.toLocaleString()}`,
                x,
                y + yOffset
            );
            increaseYOffset();
        }

        if (this.bindInfo) {
            const weightedAccuracy: number = this.getWeightedAccuracy([
                ...this.bindInfo.pp.values(),
            ]);
            this.context.fillText(
                `Accuracy: ${
                    this.player.accuracy
                }% | ${weightedAccuracy.toFixed(2)}%`,
                x,
                y + yOffset
            );
        } else {
            this.context.fillText(
                `Accuracy: ${this.player.accuracy}%`,
                x,
                y + yOffset
            );
        }
        increaseYOffset();

        this.context.fillText(
            `Play Count: ${this.player.playCount.toLocaleString()}`,
            x,
            y + yOffset
        );
        increaseYOffset();

        if (this.bindInfo) {
            const ppRank: number = await this.getPlayerPPRank(this.bindInfo);
            this.context.fillText(
                `Droid pp: ${this.bindInfo.pptotal.toFixed(
                    2
                )}pp (#${ppRank.toLocaleString()})`,
                x,
                y + yOffset
            );
            increaseYOffset();

            if (this.bindInfo.clan) {
                this.context.fillText(
                    `Clan: ${this.bindInfo.clan}`,
                    x,
                    y + yOffset
                );
                increaseYOffset();
            }
        }

        this.context.restore();
    }

    /**
     * Initializes the area where description box will be drawn.
     */
    private initDescriptionBox(): void {
        this.context.save();

        this.context.globalAlpha = 0.85;
        this.context.fillStyle =
            this.playerInfo?.picture_config.bgColor ?? "rgb(0, 139, 255)";
        this.context.fillRect(9, 197, 482, 294);

        this.context.restore();
    }

    /**
     * Draws the badges that the player owns.
     */
    private async drawBadges(): Promise<void> {
        this.context.save();

        this.context.globalAlpha = 0.6;
        this.context.fillStyle = "#b9a29b";
        this.context.fillRect(15, 312, 470, 170);
        this.context.globalAlpha = 1;

        const badges: (PartialProfileBackground | null)[] =
            this.playerInfo?.picture_config.activeBadges ?? [];

        for (let i = 0; i < badges.length; ++i) {
            const profileBadge: PartialProfileBackground | null = badges[i];

            if (!profileBadge) {
                continue;
            }

            const badgeImage: Image = await loadImage(
                `${process.cwd()}/files/images/badges/${profileBadge.id}.png`
            );
            if (i / 5 < 1) {
                this.context.drawImage(badgeImage, i * 94 + 19.5, 312, 85, 85);
            } else {
                this.context.drawImage(
                    badgeImage,
                    (i - 5) * 94 + 19.5,
                    397,
                    85,
                    85
                );
            }
        }

        this.context.restore();
    }

    /**
     * Draws the template for badges.
     */
    private drawTemplateBadges(): void {
        this.context.save();

        this.context.globalAlpha = 0.6;
        this.context.fillStyle = "#b9a29b";
        this.context.fillRect(15, 312, 470, 170);

        this.context.textAlign = "center";
        this.context.globalAlpha = 1;
        this.context.fillStyle = "#000000";
        this.context.beginPath();
        this.context.moveTo(15, 397);
        this.context.lineTo(485, 397);

        for (let i = 15 + 94; i < 15 + 94 * 6; i += 94) {
            this.context.moveTo(i, 312);
            this.context.lineTo(i, 482);
        }

        this.context.stroke();

        this.context.font = "bold 12px Exo";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        for (let i = 0; i < 10; ++i) {
            if (i / 5 < 1) {
                this.context.fillText((i + 1).toString(), 54.5 + i * 94, 353.5);
            } else {
                this.context.fillText(
                    (i + 1).toString(),
                    54.5 + (i - 5) * 94,
                    439.5
                );
            }
        }

        this.context.restore();
    }

    /**
     * Draws the Alice coins information of the player.
     */
    private async drawAliceCoinsInformation(): Promise<void> {
        this.context.save();

        const coinImage: Image = await loadImage(
            `${process.cwd()}/files/images/alicecoin.png`
        );

        this.context.drawImage(coinImage, 15, 255, 50, 50);

        this.context.font = "18px Exo";
        this.context.textBaseline = "middle";

        this.context.fillText(
            `${(
                this.playerInfo?.alicecoins ?? 0
            ).toLocaleString()} Alice Coins | ${(
                this.playerInfo?.points ?? 0
            ).toLocaleString()} Challenge Points`,
            75,
            280
        );

        this.context.restore();
    }

    /**
     * Gets the weighted accuracy of a player.
     *
     * @param ppEntries The droid performance points (dpp) entries of the player.
     * @returns The player's weighted accuracy.
     */
    private getWeightedAccuracy(ppEntries: PPEntry[]): number {
        if (ppEntries.length === 0) {
            return 0;
        }

        let accSum: number = 0;
        let weight: number = 0;

        for (let i = 0; i < ppEntries.length; ++i) {
            accSum += ppEntries[i].accuracy * Math.pow(0.95, i);
            weight += Math.pow(0.95, i);
        }

        return accSum / weight;
    }

    /**
     * Gets the player's dpp rank.
     */
    private async getPlayerPPRank(bindInfo: UserBind): Promise<number> {
        return (
            (await DatabaseManager.elainaDb?.collections.userBind.getUserDPPRank(
                bindInfo.pptotal
            )) ?? 0
        );
    }
}
