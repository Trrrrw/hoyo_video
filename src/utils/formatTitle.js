export const formatTitle = (title, game, type) => {
    if (title == '《绝区零》×《街霸6》制作人对谈') return title
    title = title
        .replace(`《${game}》——`, '') // 游戏名
        .replace(`《${game}》`, '') // 游戏名
        .trim()
    return title
}