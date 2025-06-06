import { message } from 'ant-design-vue'

export const copyText = async (text, successMsg) => {
    try {
        await navigator.clipboard.writeText(text)
        message.info(successMsg)
    } catch (err) {
        // 如果 Clipboard API 不可用，回退到旧方法
        const tempTextarea = document.createElement('textarea')
        tempTextarea.value = text
        document.body.appendChild(tempTextarea)
        tempTextarea.select()
        document.execCommand('copy')
        document.body.removeChild(tempTextarea)
        message.info(successMsg)
    }
}