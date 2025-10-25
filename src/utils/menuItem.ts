import type { Ref, VNode } from 'vue'
export interface MenuItem {
    label: string
    icon: VNode | null
    children: MenuItem[] | null
    key: string
    type: string | null
}