export const scrollToTop = (scrollableContainerRef) => {
    if (scrollableContainerRef?.$el) {
        scrollableContainerRef.$el.scrollTo({ top: 0 })
    }
}

export const scrollToPreviousPosition = (selector) => {
    const savedPosition = sessionStorage.getItem('scrollPosition')
    if (savedPosition) {
        const scrollContainer = document.querySelector(selector)
        scrollContainer.scroll({
            top: parseInt(savedPosition),
        })
        sessionStorage.removeItem('scrollPosition')
    }
}