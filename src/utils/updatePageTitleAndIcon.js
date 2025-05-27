export const updatePageTitleAndIcon = (title, iconPath) => {
    if (title) {
        document.title = title
    }
    if (iconPath) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
        link.rel = 'icon'
        link.href = new URL(iconPath, import.meta.url).href
        document.head.appendChild(link)
    }
}