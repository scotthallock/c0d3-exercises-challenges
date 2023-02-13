const express = require('express');
const app = express();
const Jimp = require('jimp');

/* Serve memegen home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/')
});

/* Server-side caching of last 10 images */
const cache = new Map();
const cacheMemes = (key, value) => {
    cache.set(key, value);
    if (cache.size > 10) {
        cache.delete(cache.keys().next().value);
    }
};

/* Request handler for meme query */
app.get('/memegen/api/:caption', (req, res) => {
    const imageUrl = req.query.src || 'https://loremflickr.com/640/480';
    const blackText = req.query.black || 'false';
    const caption = req.params.caption || '';
    const blurValue = parseInt(req.query.blur) || 0;

    /* If this query combination is in the cache, send cached buffer */
    const key = imageUrl + blackText + caption + blurValue;
    if (cache.has(key)) {
        console.log('Retrieving from cache...')
        return res.send(cache.get(key));
    }

    let loadedImage;

    Jimp.read(imageUrl)
        .then(image => { 
            /* blur the image */
            if (blurValue > 0) image.blur(blurValue);
            /* save the image to a variable*/
            loadedImage = image;
            /* load font */
            if (blackText === 'true') {
                return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
            }
            return Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        }).then(font => {
            /* write text on image */
            loadedImage.print(
                font,
                0, // x
                30, // y
                {
                text: caption,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
                },
                loadedImage.bitmap.width // max width before text wrap
            );
            return loadedImage.getBufferAsync(Jimp.MIME_JPEG);
        }).then(buffer => {
            /* Add the image buffer to the cache */
            cacheMemes(key, buffer);
            /* Send the buffer back to the client */
            res.set('Content-Type', 'image/jpeg');
            res.send(buffer);
        })
        .catch(err => {
            res.status(400).send('Bad Request - cannot generate meme.')
            console.error(err);
        });
});

app.listen(3333, () => {
    console.log('Server running on port 3333...');
});