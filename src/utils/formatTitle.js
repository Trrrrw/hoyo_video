export const formatTitle = (title, game, type) => {
    const titleList = [
        '《绝区零》×《街霸6》制作人对谈',
        '《崩坏：星穹铁道》× Fate_UBW 联动预告',
        '《崩坏：星穹铁道》× Fate[UBW] 联动PV：「相见『很』晚」',
    ]
    if (titleList.includes(title) || game == '崩坏3') return title
    title = title
        .replace(`《${game}》——`, '') // 游戏名
        .replace(`《${game}》`, '') // 游戏名
        .trim()
    return title
}