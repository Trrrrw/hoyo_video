export const formatTitle = (title, game, type) => {
    if (title == '《绝区零》×《街霸6》制作人对谈') return title
    title = title
        .replace(`《${game}》——`, '') // 游戏名
        .replace(`《${game}》`, '') // 游戏名
        .trim()
    return title
    // if (['其他', '幕后', 'CM短片'].includes(type)) {
    //     return title
    //         .replace(`《${game}》——`, '') // 游戏名
    //         .replace(`《${game}》`, '') // 游戏名
    //         .trim()
    // }
    // const result = title
    //     .replace(`《${game}》——`, '') // 游戏名
    //     .replace(`《${game}》`, '') // 游戏名
    //     .replace(`全新${type}-`, '')// 菲谢尔角色预告
    //     .replace(`${type}-`, '')
    //     .replace(`${type}———`, '')
    //     .replace(`${type}——`, '')
    //     .replace(`${type}—`, '')
    //     .replace(`${type}：`, '')
    //     .replace(`「${type}」——`, '')//流光拾遗之旅
    //     .replace(`「${type}」`, '') // 璃月雅集
    //     .replace(`声优小剧场——`, '') // 璃月雅集
    //     .replace(`小剧场——`, '') // 璃月雅集
    //     .replace(`${type} | `, '')
    //     .replace(`${type}丨`, '')
    //     .replace(`特别${type} - `, '') // EP
    //     .replace(`${type} - `, '') // EP
    //     .replace(`${type} ：`, '') // EP
    //     .replace(`${type}PV：`, '') //千星纪游
    //     .replace(`${type}回顾`, '')
    //     .replace(`提瓦特风尚·`, '')
    //     .replace(`——${type}SP`, '')
    //     .replace(`${type}`, '')
    //     .trim()
    // return result === '' ? title : result
}