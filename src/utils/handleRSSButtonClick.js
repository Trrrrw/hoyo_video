import { message } from 'ant-design-vue'

export const handleRSSButtonClick = (fileName) => {
    const rssUrl = `${window.location.origin}/${fileName}.xml`
    const tempTextarea = document.createElement('textarea')
    tempTextarea.value = rssUrl
    document.body.appendChild(tempTextarea)
    tempTextarea.select()
    document.execCommand('copy')
    document.body.removeChild(tempTextarea)
    message.info('已复制链接')
}