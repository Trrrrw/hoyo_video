// 格式化时间字符串
export const timeFromStr = (time_str: string): string => {
    const date = new Date(time_str)
    if (isNaN(date.getTime())) return time_str
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化标题
export const formatTitle = (title: string, game: string): string => {
    const skipTitles = [
        '《绝区零》×《街霸6》制作人对谈',
        '《崩坏：星穹铁道》× Fate_UBW 联动预告',
        '《崩坏：星穹铁道》× Fate[UBW] 联动PV：「相见『很』晚」',
        '《崩坏3》×《崩坏：星穹铁道》7.9版本「星间诡戏」宣传PV',
        '《崩坏3》×《崩坏：星穹铁道》联动概念PV——「对手戏」',
        '内容爆炸！《崩坏3》×《崩坏：星穹铁道》联动幕后揭秘'
    ]
    if (skipTitles.includes(title)) return title
    title = title.replace(`《${game}》`, '').trim()
    return title
}