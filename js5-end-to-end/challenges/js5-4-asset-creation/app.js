const fs = require('fs');
const express = require('express');
const { rejects } = require('assert');
const app = express();
const jsonParser = require('body-parser').json();

/* Serve home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/*
Listen to incoming POST requests to /api/files to create a file.
Listen to incoming GET requests to /api/files to get the an array containing all the files.
Listen to incoming GET requests to /api/files/file-name to get the content of file-name.

Note: fs.readdir takes in an argument (the path of folder) and a function.
The function will be called with 2 arguments (error, data) when computer finishes.

To prevent your server from getting filled up with junk files,
your server must automatically delete files after a 5 minute mark for each file.
*/

/* Wrap the fs.writeFile function in a promise */
const writeFilePromise = (filename, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./files/${filename}`, content, (err) => {
                if (err) reject(`Error writing to file: ${err}`);
                resolve(`${filename} created successfully.`)
        });
    });
};

/* Wrap the fs.readFile function in a promise */
const readFilePromise = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./files/${filename}`, 'utf8', (err, data) => {
            if (err) reject(`Error reading file: ${err}`);
            resolve(data);
        });
    });
};

/* Wrap the fs.readdir function in a promise */
const getFilenamesPromise = (path) => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) reject(`Error getting filenames: ${err}`);
            resolve(files);
        });
    });
};

/* Save button makes a POST request to /api/files */
/* The body contains the filename and the content */
app.post('/api/files', jsonParser, (req, res) => {
    writeFilePromise(req.body.filename, req.body.content)
        .then(() => { res.status(200).send('File write success.'); })
        .catch(err => { res.status(500).send(err); });
});

/* GET file contents */
app.get('/api/files/:filename', (req, res) => {
    console.log('ouch (GET) filename ', Date.now());
    // console.log('filename is ', req.params.filename)
    readFilePromise(req.params.filename)
        .then(data => { res.status(200).json(data); })
        .catch(err => { res.status(500).send(err); });
});

/* GET all filenames in the /files folder. */
app.get('/api/files', (req, res) => {
    console.log('ouch (GET)', Date.now());
    getFilenamesPromise('./files')
        .then(files => { res.status(200).json(files); })
        .catch(err => { res.status(500).send(err); });
});


/* Start server */
app.listen(3333, () => {
    console.log('Server is running on port 3333...');
});