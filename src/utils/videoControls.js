export function setupVideoControls(videoElement) {
    const handleKeyDown = (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return
        }

        

        switch (event.key) {
            case ' ':
                event.preventDefault()
                videoElement.paused ? videoElement.play() : videoElement.pause()
                break
            case 'ArrowRight':
                event.preventDefault()
                videoElement.currentTime += 5
                break
            case 'ArrowLeft':
                event.preventDefault()
                videoElement.currentTime -= 5
                break
            case 'ArrowUp':
                event.preventDefault()
                videoElement.volume = Math.min(videoElement.volume + 0.1, 1)
                break
            case 'ArrowDown':
                event.preventDefault()
                videoElement.volume = Math.max(videoElement.volume - 0.1, 0)
                break
            case 'm':
            case 'M':
                videoElement.muted = !videoElement.muted
                break
            case 'f':
            case 'F':
                if (document.fullscreenElement) {
                    document.exitFullscreen()
                } else {
                    videoElement.requestFullscreen()
                }
                break
        }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
}