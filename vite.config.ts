import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { vite as vidstack } from 'vidstack/plugins'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('media-'),
                },
            },
        }),
        vueDevTools(),
        vidstack(),
        AutoImport({
            dts: "src/auto-import.d.ts",
            //ant-design-vue
            resolvers: [AntDesignVueResolver()]
        }),
        Components({
            resolvers: [AntDesignVueResolver({ importStyle: 'css-in-js', resolveIcons: true })]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
})
