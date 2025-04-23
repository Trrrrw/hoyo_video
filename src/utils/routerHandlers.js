import router from "../router"

export const navigateTo = (to) => {
    router.push(to)
}

export const navigateToHome = () => {
    navigateTo("/")
}

export const navigateToSpecificGame = (gameName) => {
    navigateTo(`/${gameName}`)
}

export const navigateToSpecificType = (gameName, type) => {
    navigateTo({
        name: 'Videos',
        params: { game: gameName },
        query: { type: type, page: 1, pageSize: 20 },
    })
}

export const navigateToVideo = (gameName, videoId) => {
    navigateTo({
        name: 'Player',
        params: { game: gameName },
        query: { id: videoId }
    })
}

export const navigateToSearch = (gameName, searchQuery = undefined) => {
    const query = {
        game: gameName,
        ...(searchQuery && { q: searchQuery })
    }
    navigateTo({
        name: 'Search',
        query
    })
}

export const openGitHubRepo = () => {
    window.open('https://github.com/Trrrrw/hoyo_video')
}