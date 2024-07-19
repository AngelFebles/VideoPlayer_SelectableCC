const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const videoFolder = path.join(__dirname, 'files');

app.use(express.static(__dirname));

app.get('/videos', (req, res) => {
    fs.readdir(videoFolder, (err, files) => {
        if (err) {
            res.status(500).send('Unable to scan directory');
        } else {
            const videos = files.filter(file => file.endsWith('.mp4') || file.endsWith('.mkv'));
            res.json(videos);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
