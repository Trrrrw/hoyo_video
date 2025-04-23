export const handleRSSButtonClick = (fileName) => {
    window.location.href = `${window.location.origin}/${fileName}.xml`
}