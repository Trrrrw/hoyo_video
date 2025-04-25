export const updatePageTitleAndIcon = (title, iconPath) => {
    document.title = title
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = new URL(iconPath, import.meta.url).href
    document.head.appendChild(link)
}