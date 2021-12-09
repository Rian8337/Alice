export abstract class Interpolation {
    static lerp(start: number, final: number, amount: number): number {
        return start + (final - start) * amount;
    }
}
