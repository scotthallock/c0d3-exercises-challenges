const { rejects } = require('assert');
const express = require('express'); // Import express library
const app = express(); // Use the express library to create an app

// When a GET request comes in at the path `/hello`, send back some HTML.
app.get('/hello', (req, res) => { // two arguemnts (request, response)
    res.send('<h1> Hello world </h1>');
});

// When a DELETE request comes in at the path `/hello`
app.delete('/hello', (req, res) => {
    res.send('ok');
});

// A get path called /count that tells users how many times a path has been visited.
let count = 0;
app.get('/count', async (req, res) => {
    count += 1;
    return res.send(`The path has been visited ${count} times.`);
})

// Create a get path called /delay that will send back a response only after 5 seconds.
// (Simulating a slow response).
app.get('/delay', async (req, res) => {
    setTimeout(() => { 
        res.send(`
        <h1>Sorry that took a while.</h1>
    `)}, 5000);
});

// Create a file with the file name hello.
// Create a get path called /getfile that sends back the file.

const fs = require('fs');
/* create the file */
fs.writeFile('hello.txt', `Hey what's up hello`, (err) => {});

/* using res.sendFile() */
app.get('/getfile', async (req, res) => {
    res.sendFile('hello.txt', {root: __dirname}, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error: Error sending file');
        }
        console.log('Sent file successfully.');
    });
});

/* using fs.readFile */
app.get('/getfile', async (req, res) => {
    fs.readFile('hello.txt', (err, data) => {
        if (err) return res.status(500).send('Error: Error reading file')
        res.send(`<div>${data}</div>`)
    })
})
 


app.listen(3000); // Listen to a port number.