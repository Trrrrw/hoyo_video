export const loadGameIcon = (game: string): string => {
    try {
        return new URL(`../assets/images/game_logo/${game}.avif`, import.meta.url).href
    } catch {
        return ''
    }
}