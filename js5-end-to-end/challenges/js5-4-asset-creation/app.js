const fs = require('fs');
const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();

/* Serve home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/* Directory of user-created files */
const dir = './files';

/* Delete files in the ./files folder than 5 minutes (300,000 ms). */
const deleteOldFiles = async () => {
    const files = await fs.promises.readdir(dir);
    files.forEach(async (file) => {
        try {
            const filepath = dir + '/' + file;
            const stats = await fs.promises.stat(filepath);
            /* stats.mtimeMs is last modified time of file */
            /* stats.mtimeMs and Date.now() are expressed in [ms] since Unix epoch */
            /* do not delete 'example.txt' */
            if (file !== 'example.txt' &&
                Date.now() - stats.mtimeMs > 300000) {
                await fs.promises.unlink(filepath);
                console.log(`Deleted ${file}`);
            }
        } catch (err) {
            console.error(err);
        }
    });
    /* recursively call this function every 30 seconds */
    setTimeout(deleteOldFiles, 30000);
};
deleteOldFiles();

/* Request handler - saving (writing to) a file. */
app.post('/api/files', jsonParser, async (req, res) => {
    try {
        const result = await fs.promises.writeFile(
            `${dir}/${req.body.filename}`,
            req.body.content,
            'utf8'
        );
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

/* Request handler - get a file's contents. */
app.get('/api/files/:filename', async (req, res) => {
    try {
        const data = await fs.promises.readFile(
            `${dir}/${req.params.filename}`,
             'utf8'
        );
        res.status(200).json(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

/* Request handler - get all filenames in the /files folder. */
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.promises.readdir(dir);
        res.status(200).json(files);
    } catch (err) {
        res.status(500).send(err);
    }
});

/* Start server */
app.listen(3333, () => {
    console.log('Server is running on port 3333...');
});