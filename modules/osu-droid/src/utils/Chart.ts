import { Canvas, Image, createCanvas, CanvasRenderingContext2D } from "canvas";
import { Vector2 } from "../mathutil/Vector2";

type AxisType = "time";

interface ChartInitializer {
    /**
     * The width of the graph.
     */
    readonly graphWidth: number;

    /**
     * The height of the graph.
     */
    readonly graphHeight: number;

    /**
     * The minimum X axis value of the graph.
     */
    readonly minX: number;

    /**
     * The minimum Y axis value of this graph.
     */
    readonly minY: number;

    /**
     * The maximum X axis value of this graph.
     */
    readonly maxX: number;

    /**
     * The maximum Y axis value of this graph.
     */
    readonly maxY: number;

    /**
     * The units per tick for X axis.
     */
    readonly unitsPerTickX: number;

    /**
     * The units per tick for Y axis.
     */
    readonly unitsPerTickY: number;

    /**
     * The background of this graph.
     */
    readonly background?: Image;

    /**
     * The X axis label of the graph.
     */
    readonly xLabel?: string;

    /**
     * The Y axis label of the graph.
     */
    readonly yLabel?: string;

    /**
     * The radius of a data point in the graph. Set to 0 to disable this.
     */
    readonly pointRadius?: number;

    /**
     * The value type for X axis.
     */
    readonly xValueType?: AxisType;

    /**
     * The value type for Y axis.
     */
    readonly yValueType?: AxisType;
}

/**
 * A structure for defining data object.
 */
interface Data {
    /**
     * The x value of this datum.
     */
    readonly x: number;

    /**
     * The y value of this datum.
     */
    readonly y: number;
}

/**
 * Utility to draw a graph with only node-canvas.
 *
 * Used for creating strain graph of beatmaps.
 */
export class Chart implements ChartInitializer {
    /**
     * The canvas instance of this chart.
     */
    readonly canvas: Canvas;

    /**
     * The 2D rendering surface for the drawing surface of this chart.
     */
    readonly context: CanvasRenderingContext2D;

    readonly graphWidth: number;
    readonly graphHeight: number;
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly unitsPerTickX: number;
    readonly unitsPerTickY: number;
    readonly background?: Image;
    readonly xLabel?: string;
    readonly yLabel?: string;
    readonly xValueType?: AxisType;
    readonly yValueType?: AxisType;
    readonly pointRadius: number;

    private readonly padding: number = 10;
    private readonly tickSize: number = 10;
    private readonly axisColor: string = "#555";
    private readonly font: string = "12pt Calibri";
    private readonly axisLabelFont: string = "bold 11pt Calibri";
    private readonly fontHeight: number = 12;
    private readonly baseLabelOffset: number = 15;

    private readonly rangeX: number;
    private readonly rangeY: number;
    private readonly numXTicks: number;
    private readonly numYTicks: number;
    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly height: number;
    private readonly scaleX: number;
    private readonly scaleY: number;

    /**
     * @param values Initializer options for the graph.
     */
    constructor(values: ChartInitializer) {
        this.graphWidth = values.graphWidth;
        this.graphHeight = values.graphHeight;

        this.canvas = createCanvas(this.graphWidth, this.graphHeight);
        this.context = this.canvas.getContext("2d");
        this.minX = values.minX;
        this.minY = values.minY;
        this.maxX = values.maxX;
        this.maxY = values.maxY;
        this.unitsPerTickX = values.unitsPerTickX;
        this.unitsPerTickY = values.unitsPerTickY;
        this.background = values.background;
        this.xLabel = values.xLabel;
        this.yLabel = values.yLabel;
        this.xValueType = values.xValueType;
        this.yValueType = values.yValueType;
        this.pointRadius = Math.max(0, values.pointRadius ?? 1);

        // Relationships
        this.rangeX = this.maxX - this.minX;
        this.rangeY = this.maxY - this.minY;
        this.numXTicks = Math.round(this.rangeX / this.unitsPerTickX);
        this.numYTicks = Math.round(this.rangeY / this.unitsPerTickY);
        this.x = this.getLongestValueWidth() + this.padding * 2;
        this.y = this.padding * 2;
        this.width = this.canvas.width - this.x - this.padding * 2;
        this.height =
            this.canvas.height - this.y - this.padding - this.fontHeight;
        this.scaleX =
            (this.width - (this.xLabel ? this.baseLabelOffset : 0)) /
            this.rangeX;
        this.scaleY =
            (this.height - (this.yLabel ? this.baseLabelOffset : 0)) /
            this.rangeY;

        // Draw background and X and Y axis tick marks
        this.setBackground();
        this.drawXAxis(true);
        this.drawYAxis(true);
    }

    /**
     * Draws a line graph with specified data, color, and line width.
     *
     * @param data The data to make the graph.
     * @param color The color of the line.
     * @param width The width of the line.
     */
    drawLine(data: (Data | Vector2)[], color: string, width: number): void {
        const c: CanvasRenderingContext2D = this.context;
        c.save();
        this.transformContext();
        c.lineWidth = width;
        c.strokeStyle = c.fillStyle = color;
        c.beginPath();
        c.moveTo(data[0].x * this.scaleX, data[0].y * this.scaleY);

        for (let n = 0; n < data.length; ++n) {
            const point: Data = data[n];

            // Data segment
            c.lineTo(point.x * this.scaleX, point.y * this.scaleY);
            c.stroke();
            c.closePath();
            if (this.pointRadius) {
                c.beginPath();
                c.arc(
                    point.x * this.scaleX,
                    point.y * this.scaleY,
                    this.pointRadius,
                    0,
                    2 * Math.PI,
                    false
                );
                c.fill();
                c.closePath();
            }

            // Position for next segment
            c.beginPath();
            c.moveTo(point.x * this.scaleX, point.y * this.scaleY);
        }

        c.restore();
    }

    /**
     * Draws an area graph with specified data and color.
     *
     * @param data The data to make the graph.
     * @param color The color of the area.
     */
    drawArea(data: (Data | Vector2)[], color: string): void {
        const c: CanvasRenderingContext2D = this.context;
        c.save();
        this.transformContext();
        c.strokeStyle = c.fillStyle = color;

        c.beginPath();
        data.forEach((d: Data) =>
            c.lineTo(d.x * this.scaleX, d.y * this.scaleY)
        );
        c.stroke();
        c.lineTo(data.at(-1)!.x * this.scaleX, 0);
        c.lineTo(0, 0);
        c.fill();

        c.restore();

        // Redraw axes since it gets
        // overlapped by chart area
        if (color !== this.axisColor) {
            this.drawXAxis();
            this.drawYAxis();
        }
    }

    /**
     * Returns a Buffer that represents the graph.
     */
    getBuffer(): Buffer {
        return this.canvas.toBuffer();
    }

    /**
     * Draws the X axis of the graph.
     *
     * @param drawLabel Whether or not to draw the axis label.
     */
    private drawXAxis(drawLabel?: boolean): void {
        const c: CanvasRenderingContext2D = this.context;
        const labelOffset: number = this.xLabel ? this.baseLabelOffset : 0;
        const yLabelOffset: number = this.yLabel ? this.baseLabelOffset : 0;
        c.save();
        if (this.xLabel && drawLabel) {
            c.textAlign = "center";
            c.font = this.axisLabelFont;
            c.fillText(
                this.xLabel,
                this.x + this.width / 2,
                this.y + this.height + labelOffset
            );
            c.restore();
        }
        c.beginPath();
        c.moveTo(this.x + yLabelOffset, this.y + this.height - labelOffset);
        c.lineTo(this.x + this.width, this.y + this.height - labelOffset);
        c.strokeStyle = this.axisColor;
        c.lineWidth = 2;
        c.stroke();

        // Draw tick marks
        for (let n = 0; n < this.numXTicks; ++n) {
            c.beginPath();
            c.moveTo(
                ((n + 1) * (this.width - yLabelOffset)) / this.numXTicks +
                    this.x +
                    yLabelOffset,
                this.y + this.height - labelOffset
            );
            c.lineTo(
                ((n + 1) * (this.width - yLabelOffset)) / this.numXTicks +
                    this.x +
                    yLabelOffset,
                this.y + this.height - labelOffset - this.tickSize
            );
            c.stroke();
        }

        // Draw labels
        c.font = this.font;
        c.fillStyle = "black";
        c.textAlign = "center";
        c.textBaseline = "middle";

        for (let n = 0; n < this.numXTicks; ++n) {
            const label: number = Math.round(
                ((n + 1) * this.maxX) / this.numXTicks
            );
            let stringLabel: string = label.toString();
            switch (this.xValueType) {
                case "time":
                    stringLabel = this.timeString(label);
                    break;
            }
            c.save();
            c.translate(
                ((n + 1) * (this.width - yLabelOffset)) / this.numXTicks +
                    this.x +
                    yLabelOffset,
                this.y + this.height + this.padding - labelOffset
            );
            c.fillText(stringLabel, 0, 0);
            c.restore();
        }

        c.restore();
    }

    /**
     * Draws the Y axis of the graph.
     *
     * @param drawLabel Whether or not to draw the axis label.
     */
    private drawYAxis(drawLabel?: boolean): void {
        const c: CanvasRenderingContext2D = this.context;
        const labelOffset: number = this.yLabel ? this.baseLabelOffset : 0;
        const xLabelOffset: number = this.xLabel ? this.baseLabelOffset : 0;
        c.save();
        if (this.yLabel && drawLabel) {
            c.textAlign = "center";
            c.font = this.axisLabelFont;
            c.translate(0, this.graphHeight);
            c.rotate(-Math.PI / 2);
            c.fillText(
                this.yLabel,
                this.y + xLabelOffset + this.height / 2,
                this.x - labelOffset * 2.5
            );
            c.restore();
        }
        c.beginPath();
        c.moveTo(this.x + labelOffset, this.y);
        c.lineTo(this.x + labelOffset, this.y + this.height - xLabelOffset);
        c.strokeStyle = this.axisColor;
        c.lineWidth = 2;
        c.stroke();
        c.restore();

        // Draw tick marks
        for (let n = 0; n < this.numYTicks; ++n) {
            c.beginPath();
            c.moveTo(
                this.x + labelOffset,
                (n * (this.height - xLabelOffset)) / this.numYTicks + this.y
            );
            c.lineTo(
                this.x + labelOffset + this.tickSize,
                (n * (this.height - xLabelOffset)) / this.numYTicks + this.y
            );
            c.stroke();
        }

        // Draw values
        c.font = this.font;
        c.fillStyle = "black";
        c.textAlign = "right";
        c.textBaseline = "middle";

        for (let n = 0; n < this.numYTicks; ++n) {
            const value: number = Math.round(
                this.maxY - (n * this.maxY) / this.numYTicks
            );
            c.save();
            c.translate(
                this.x + labelOffset - this.padding,
                (n * (this.height - xLabelOffset)) / this.numYTicks + this.y
            );
            c.fillText(value.toString(), 0, 0);
            c.restore();
        }

        c.restore();
    }

    /**
     * Transforms the context and move it to the center of the graph.
     */
    private transformContext(): void {
        const c: CanvasRenderingContext2D = this.context;

        // Move context to point (0, 0) in graph
        c.translate(
            this.x + (this.yLabel ? this.baseLabelOffset : 0),
            this.y + this.height - (this.xLabel ? this.baseLabelOffset : 0)
        );

        // Invert the Y scale so that it
        // increments as we go upwards
        c.scale(1, -1);
    }

    /**
     * Gets the longest width from each label text in Y axis.
     */
    private getLongestValueWidth(): number {
        this.context.font = this.font;
        let longestValueWidth: number = 0;
        for (let n = 0; n < this.numYTicks; ++n) {
            const value: number = this.maxY - n * this.unitsPerTickY;
            let stringValue: string = value.toString();
            switch (this.yValueType) {
                case "time":
                    stringValue = this.timeString(value);
                    break;
            }
            longestValueWidth = Math.max(
                longestValueWidth,
                this.context.measureText(stringValue).width
            );
        }
        return longestValueWidth;
    }

    /**
     * Sets the background of the graph.
     */
    private setBackground(): void {
        if (!this.background) {
            this.context.globalAlpha = 0.7;
            this.context.fillStyle = "#ffffff";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            return;
        }
        this.context.globalAlpha = 1;
        this.context.drawImage(
            this.background,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        this.context.globalAlpha = 0.8;
        this.context.fillStyle = "#bbbbbb";
        this.context.fillRect(0, 0, 900, 250);
        this.context.globalAlpha = 1;
        this.context.fillStyle = "#000000";
    }

    /**
     * Time string parsing function for axis labels.
     */
    private timeString(second: number): string {
        return new Date(1000 * Math.ceil(second))
            .toISOString()
            .substr(11, 8)
            .replace(/^[0:]+/, "");
    }
}
