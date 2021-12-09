/**
 * A namespace containing links of rank images and a method to return them.
 */
export namespace rankImage {
    export enum rankImage {
        S = "http://ops.dgsrz.com/assets/images/ranking-S-small.png",
        A = "http://ops.dgsrz.com/assets/images/ranking-A-small.png",
        B = "http://ops.dgsrz.com/assets/images/ranking-B-small.png",
        C = "http://ops.dgsrz.com/assets/images/ranking-C-small.png",
        D = "http://ops.dgsrz.com/assets/images/ranking-D-small.png",
        SH = "http://ops.dgsrz.com/assets/images/ranking-SH-small.png",
        X = "http://ops.dgsrz.com/assets/images/ranking-X-small.png",
        XH = "http://ops.dgsrz.com/assets/images/ranking-XH-small.png",
    }

    /**
     * Returns an image of specified rank.
     *
     * @param rank The rank to get image from.
     */
    export function get(rank: string = ""): string {
        rank = rank.toUpperCase();
        for (const rankEntry in rankImage) {
            const entry = rankEntry as keyof typeof rankImage;
            if (rank === rankEntry) {
                return rankImage[entry];
            }
        }
        return "Unknown";
    }
}
