export const scrollToPreviousPosition = (selector) => {
    const savedPosition = sessionStorage.getItem('scrollPosition')
    if (savedPosition) {
        const scrollContainer = document.querySelector(selector)
        scrollContainer.scroll({
            top: parseInt(savedPosition),
            behavior: 'smooth'
        })
        sessionStorage.removeItem('scrollPosition')
    }
}