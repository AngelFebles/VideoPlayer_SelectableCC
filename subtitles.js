document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video-player');
    const subtitleContainer = document.getElementById('subtitle-container');

    fetch('.cc/***yourCCHere**') // Change this to the path of your CC file
        .then(response => response.text())
        .then(data => {
            const subtitles = parseVTT(data);
            video.addEventListener('timeupdate', () => {
                const currentTime = video.currentTime;
                const currentSubtitle = subtitles.find(sub => 
                    currentTime >= sub.start && currentTime <= sub.end
                );
                
                if (currentSubtitle) {
                    subtitleContainer.textContent = currentSubtitle.text;
                } else {
                    subtitleContainer.textContent = '';
                }
            });
        });
});

function parseVTT(vttContent) {
    const lines = vttContent.trim().split('\n');
    const subtitles = [];
    let currentSubtitle = {};

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('-->')) {
            const [start, end] = line.split('-->').map(timeToSeconds);
            currentSubtitle = { start, end, text: '' };
        } else if (line !== '') {
            currentSubtitle.text += (currentSubtitle.text ? ' ' : '') + line;
        } else if (currentSubtitle.text) {
            subtitles.push(currentSubtitle);
            currentSubtitle = {};
        }
    }
    if (currentSubtitle.text) {
        subtitles.push(currentSubtitle);
    }
    return subtitles;
}

function timeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.trim().split(':').map(parseFloat);
    return hours * 3600 + minutes * 60 + seconds;
}