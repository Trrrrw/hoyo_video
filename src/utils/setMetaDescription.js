export const setMetaDescription = description => {
    const metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    metaDescription.content = description
    document.head.appendChild(metaDescription)
}