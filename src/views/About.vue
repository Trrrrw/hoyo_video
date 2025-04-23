<script setup>
import { ref, shallowRef, watchEffect } from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { setMetaDescription } from '../utils/setMetaDescription'
const loading = ref(true)
const marked = new Marked(
    markedHighlight({

        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
)
const markdownPreview = shallowRef()
const loadAboutMD = () => {
    loading.value = true
    const res = fetch('/README.md')
    res.then(res => {
        res.text().then(text => {
            const logoPath = new URL('../assets/logos/logo.png', import.meta.url).href;
            const correctedText = text.replace(
                'src="src/assets/logos/logo.png"',
                `src="${logoPath}"`
            ).replace(
                '[![Product Screen Shot][product-screenshot]](https://hoyo-video.trrw.tech/)',
                ''
            ).replace(/href="#.+"/g, '')
            markdownPreview.value = marked.parse(correctedText)
        })
    })
    loading.value = false
}
const setPageIcon = () => {
    document.title = '关于 | 影像档案架'// 设置页面标题
    // 设置页面图标
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = '/favicon.ico'
    document.head.appendChild(link)
}
watchEffect(() => {
    loadAboutMD()
    setPageIcon()
    setMetaDescription(`关于 | 影像档案架`)
})
</script>

<template>
    <a-spin :delay="500" tip="Loading..." :spinning="loading">
        <a-flex justify="flex-start" align="flex-start" vertical class="about-container">
            <div class="markdown-preview" v-html="markdownPreview"></div>
        </a-flex>
    </a-spin>
    <!-- <img src="../assets/images/screenshot.webp" alt="logo" class="logo"> -->
</template>

<style scoped>
.about-container {
    margin: 0 auto;
    width: min(100% - 48px, 1000px);
    padding-top: 24px;
}

.markdown-preview {
    line-height: 2 !important;
    text-align: left !important;
    max-width: 100%;
    overflow-x: auto;
}

:deep(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.2em 0.4em;
}
</style>
