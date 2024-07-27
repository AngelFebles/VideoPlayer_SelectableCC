document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('video-player');
    const videoSource = document.getElementById('video-source');
    const subtitleContainer = document.getElementById('subtitle-container');

    const urlParams = new URLSearchParams(window.location.search);
    const selectedVideo = urlParams.get('video');


    const videoList = document.getElementById('video-list');
             // Fetch list of videos from the node server
            fetch('/videos')
                .then(response => response.json())
                .then(videos => {
                    // Append videos to list with video options
                    videos.forEach(video => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = `player.html?video=${encodeURIComponent(video)}`;
                        link.textContent = video;
                        listItem.appendChild(link);
                        videoList.appendChild(listItem);
                    });
                });


    if (selectedVideo) {
        // Set the video source to the selected video file and load it
        videoSource.src = `files/${selectedVideo}`;
        videoPlayer.load();

        // Get the corresponding subtitle file
        const ccFile = `files/${selectedVideo.replace(/\.[^/.]+$/, "")}.srt`;

        // Fetch and parse the subtitle file
        fetch(ccFile)
            .then(response => response.text())
            .then(data => {
                const subtitles = parseVTT(data);
                // Update the subtitle container based on the current video time
                videoPlayer.addEventListener('timeupdate', () => {
                    const currentTime = videoPlayer.currentTime;
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
    }

     // Pause video when hovering over the subtitle container
    subtitleContainer.addEventListener('mouseover', function() {
        videoPlayer.pause();
    });
     // Resume when not hovering anymore
    subtitleContainer.addEventListener('mouseout', function() {
        videoPlayer.play();
    });
});

// Fetch and parse subtitle file
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