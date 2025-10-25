type VueRefWithEl = { $el: HTMLElement }

export const scrollToTop = (scrollableContainerRef: VueRefWithEl | null, smooth: boolean = false): void => {
    if (scrollableContainerRef?.$el) {
        scrollableContainerRef.$el.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
}

export const scrollToPreviousPosition = () => {
    const savedPosition = sessionStorage.getItem('containerScrollTop')
    if (savedPosition) {
        const scrollContainer = document.querySelector('#app > section > section > main > section > main')
        scrollContainer?.scroll({
            top: parseInt(savedPosition),
        })
        sessionStorage.removeItem('containerScrollTop')
    }
}