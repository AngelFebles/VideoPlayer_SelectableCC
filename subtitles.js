document.addEventListener('DOMContentLoaded', function() {
    const videoSelect = document.getElementById('video-select');
    const videoPlayer = document.getElementById('video-player');
    const videoSource = document.getElementById('video-source');
    const subtitleContainer = document.getElementById('subtitle-container');
   

        // Fetch list of videos from the node server
        fetch('/videos')
        .then(response => response.json())
        .then(videos => {
            videos.forEach(video => {
                // Append videos to dropdown list with video options
                const option = document.createElement('option');
                option.value = `files/${video}`;
                option.textContent = video;
                videoSelect.appendChild(option);
            });
        });

    videoSelect.addEventListener('change', function() {
        const selectedVideo = videoSelect.value;
        if (selectedVideo) {
            videoSource.src = selectedVideo;
            videoPlayer.load();
            const ccFile = `files/${selectedVideo.split('/').pop().replace(/\.[^/.]+$/, "")}.srt`;

            //This is what makes CC selectable and compatible with hover dictionary (and the whole point behind this project)
            //We are transforming cc into js objects and we display them on top of the video.

            //Couldn't find a way to make them appear when video is in fullscreen mode, but I think it's a good start.
            fetch(ccFile)
                .then(response => response.text())
                .then(data => {
                    const subtitles = parseVTT(data);
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
    });

     // Pause video when hovering over the subtitle container
    subtitleContainer.addEventListener('mouseover', function() {
        videoPlayer.pause();
    });
    
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

