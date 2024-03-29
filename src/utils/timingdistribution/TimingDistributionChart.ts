import {
    Beatmap,
    DroidHitWindow,
    Mod,
    ModPrecise,
    ModUtil,
    RGBColor,
    Slider,
    Spinner,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import {
    HitResult,
    ReplayObjectData,
} from "@rian8337/osu-droid-replay-analyzer";
import { Canvas, createCanvas } from "canvas";

/**
 * A timing distribution chart.
 */
export class TimingDistributionChart {
    /**
     * The beatmap.
     */
    private readonly beatmap: Beatmap;

    /**
     * The hit object data to draw.
     */
    private readonly hitObjectData: ReplayObjectData[];

    /**
     * The hit window.
     */
    private readonly hitWindow: DroidHitWindow;

    /**
     * Whether the Precise mod was used.
     */
    private readonly isPrecise: boolean;

    private canvas?: Canvas;
    private chartBarInterval = 0;
    private maxFrequency = 1;

    private readonly barOffset = 2.5;
    private readonly barWidth = 5;
    private readonly barHeight = 150;
    private readonly oneSideBarCount = 50;

    /**
     * @param beatmap The beatmap that was played.
     * @param mods The mods that was used.
     * @param hitObjectData The hit object data from replay.
     */
    constructor(
        beatmap: Beatmap,
        mods: Mod[],
        hitObjectData: ReplayObjectData[],
    ) {
        this.beatmap = beatmap;
        this.hitObjectData = hitObjectData;

        const od = calculateDroidDifficultyStatistics({
            overallDifficulty: beatmap.difficulty.od,
            mods: ModUtil.removeSpeedChangingMods(mods),
            convertOverallDifficulty: false,
        }).overallDifficulty;

        this.hitWindow = new DroidHitWindow(od);
        this.isPrecise = mods.some((m) => m instanceof ModPrecise);
    }

    /**
     * Generates the chart.
     *
     * @returns The canvas used to draw the chart.
     */
    generate(): Buffer {
        if (this.canvas) {
            return this.canvas.toBuffer();
        }

        this.canvas = createCanvas(800, 200);

        this.initBackground();
        this.drawChartBars();
        this.drawText();

        return this.canvas.toBuffer();
    }

    /**
     * Initializes the background of the canvas.
     */
    private initBackground(): void {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");

        context.save();

        context.fillStyle = "#424242";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        context.restore();
    }

    /**
     * Initializes chart bars.
     */
    private drawChartBars(): void {
        if (!this.canvas) {
            return;
        }

        const hitValues: Record<number, number> = {};
        let maxAccuracy = 0;

        for (let i = 0; i < this.hitObjectData.length; ++i) {
            const object = this.beatmap.hitObjects.objects[i];
            const objectData = this.hitObjectData[i];

            if (objectData.result === HitResult.miss) {
                continue;
            }

            if (object instanceof Spinner) {
                continue;
            }

            if (
                object instanceof Slider &&
                objectData.accuracy ===
                    Math.floor(this.hitWindow.hitWindowFor50(this.isPrecise)) +
                        13
            ) {
                continue;
            }

            const accuracy: number = Math.trunc(objectData.accuracy);

            hitValues[accuracy] ??= 0;
            ++hitValues[accuracy];

            maxAccuracy = Math.max(Math.abs(accuracy), maxAccuracy);
        }

        this.chartBarInterval = Math.max(
            1,
            Math.ceil(maxAccuracy / this.oneSideBarCount),
        );

        // Start from the left.
        const frequencies: number[] = [];
        for (let i = -this.oneSideBarCount; i <= this.oneSideBarCount; ++i) {
            let frequency = 0;

            for (
                let j = i * this.chartBarInterval;
                j < this.chartBarInterval * (i + 1);
                ++j
            ) {
                if (!hitValues[j]) {
                    continue;
                }

                frequency += hitValues[j];
            }

            frequencies.push(frequency);
        }

        this.maxFrequency = Math.max(1, ...frequencies);

        const getHitResultColor = (time: number): RGBColor => {
            time = Math.abs(time);

            switch (true) {
                case time <= this.hitWindow.hitWindowFor300(this.isPrecise):
                    return new RGBColor(102, 204, 255);
                case time <= this.hitWindow.hitWindowFor100(this.isPrecise):
                    return new RGBColor(179, 217, 68);
                default:
                    return new RGBColor(255, 204, 34);
            }
        };

        // Now we draw from the left to right.
        for (let i = -this.oneSideBarCount; i <= this.oneSideBarCount; ++i) {
            const frequency = frequencies[i + this.oneSideBarCount];

            this.drawBar(
                frequency,
                i,
                getHitResultColor(i * this.chartBarInterval),
            );
        }
    }

    /**
     * Draws an offset bar.
     *
     * @param frequency The frequency of the bar.
     * @param positionIndex The postiion index of the bar.
     * @param color The color of the bar.
     */
    private drawBar(
        frequency: number,
        positionIndex: number,
        color: RGBColor,
    ): void {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");
        const barXPosition =
            this.canvas.width / 2 +
            (this.barWidth + this.barOffset) * positionIndex;
        const barYPosition = this.canvas.height - 20;

        context.save();
        context.lineCap = "round";

        context.beginPath();

        if (frequency > 0) {
            context.lineWidth = this.barWidth;
            context.strokeStyle = `rgb(${color})`;

            context.moveTo(barXPosition, barYPosition);
            context.lineTo(
                barXPosition,
                barYPosition - (this.barHeight * frequency) / this.maxFrequency,
            );
        } else if (positionIndex !== 0) {
            context.lineWidth = this.barWidth / 2;
            context.strokeStyle = "#bbbbbb";

            context.moveTo(barXPosition - this.barOffset / 2, barYPosition);
            context.lineTo(barXPosition + this.barOffset / 2, barYPosition);
        }

        context.stroke();
        context.closePath();

        if (positionIndex === 0) {
            // Middle point, draw middle bar
            context.strokeStyle = "#ffffff";

            context.beginPath();

            context.moveTo(barXPosition, barYPosition);
            context.lineTo(
                barXPosition,
                barYPosition -
                    (this.barHeight * (frequency || this.maxFrequency)) /
                        this.maxFrequency /
                        2,
            );

            context.stroke();
            context.closePath();
        }

        context.restore();
    }

    /**
     * Draws offset texts under bars.
     */
    private drawText(): void {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext("2d");
        const textYPosition = this.canvas.height - 10;

        context.save();

        // Title
        context.font = "14px bold Exo";
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText("Timing Distribution", this.canvas.width / 2, 15);

        // Bar text
        context.font = "10px bold Exo";

        for (
            let i = -this.oneSideBarCount;
            i <= this.oneSideBarCount;
            i += 10
        ) {
            const textXPosition =
                this.canvas.width / 2 + (this.barWidth + this.barOffset) * i;
            const offset = this.chartBarInterval * i;
            let text = "";

            if (offset > 0) {
                text += "+";
            }

            text += offset;

            context.fillText(text, textXPosition, textYPosition);
        }

        context.restore();
    }
}
