export const getColorFromString = str => {
    if (!str) return '#1890ff' // 默认颜色

    // 简单的哈希算法
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    // 转换为6位16进制
    let color = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF
        color += ('00' + value.toString(16)).slice(-2)
    }

    return color
}