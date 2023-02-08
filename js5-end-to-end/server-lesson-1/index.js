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
// app.get('/getfile', async (req, res) => {
//     res.sendFile('hello.txt', {root: __dirname}, (err, data) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).send('Error: Error sending file');
//         }
//         console.log('Sent file successfully.');
//     });
// });

/* using fs.readFile */
app.get('/getfile', async (req, res) => {
    fs.readFile('hello.txt', (err, data) => {
        if (err) return res.status(500).send('Error: Error reading file')
        res.send(`<div>${data}</div>`)
    })
})

// Create a path called /abtest which displays Hello World in green 1 in 5 times.
// The rest of the times, it will display in red.
let abCount = 1;
app.get('/abtest', (req, res) => {
    abCount += 1;
    res.send(`<h1 style="color:${abCount % 5 === 0 ? 'green' : 'red'}">Hello World</h1>`);
});


/**
 * REQUEST AND RESPONSE HEADERS
 */

/* setting and getting cookies */
app.get('/set', (req, res) => {
    /* set the cookie before sending */
    res.set({
        'set-cookie': 'name=c0d3js5' // set a key-value pair for the cookie
    })
    /* in the Application tab of developer tools, we can see a cookie with value `c0d3js5` */
    res.send(`<h1>Cookie has been set</h1>`)
});

app.get('/', (req, res) => {
    /* get the cookie from the req parameter */
    res.send(`<h1>Welcome ${req.get('cookie')}</h1>`);
});

/**
 * CACHE CONTROL
 * on our first request, the server takes 3 seconds to respond
 * after the text appears, if we make get request to /ignore again,
 * by opening a new tab with the path /ignore,
 * we will see the 'Cached page' text immediately because the response
 * was saved in the cache
 * 
 * however, hitting the refresh button appears to force a new response
 */
app.get('/ignore', (req, res) => {
    /* see if the server actually recieved a request or not */
    console.log('ouch', Date.now());
    res.set('Cache-Control', 'max-age=120'); // save the response for 120 seconds
    setTimeout(() => {
        res.send('<h1>Cached page</h1>')
    }, 3000);
})


app.listen(3000); // Listen to a port number.