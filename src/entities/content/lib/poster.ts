// TMDB serves the same poster in several widths: /t/p/w500/... → /t/p/w185/...
const TMDB_POSTER = /^(https:\/\/image\.tmdb\.org\/t\/p\/)w\d+(\/.+)$/;
const TMDB_WIDTHS = [92, 185, 342, 500] as const;

/** srcset for TMDB posters, so a 170px card does not download a 500px image. */
export const posterSrcSet = (url: string) => {
    const match = TMDB_POSTER.exec(url);
    if (!match) return undefined;
    return TMDB_WIDTHS.map((width) => `${match[1]}w${width}${match[2]} ${width}w`).join(", ");
};
