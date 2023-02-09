/* Set up express and EJS */
const express = require('express');
const app = express();
app.set('view engine', 'ejs');

/* Global variables */ 
const visitorInfo = ['hey there']; // data to send when '/api/visitors' is requested
const visitorIPs = []; // used to track new vs. repeat visitors
const locFrequency = {}; // key: location | value: visitor count
let visitorsHTML = '';

/* Functions */










/* Request for home page */
app.get('/', (req, res) => {
    res.render('pages/home');
});


/* Request for /visitors page */
app.get('/visitors', (req, res) => {
    res.render('pages/visitors');
})

/* Request for /city page */
app.get('/city/:location', (req, res) => {
    const loc = req.params.location;
    res.render('pages/city', {
        location: loc
    });
})


/* Request for /api/visitors page */
app.get('/api/visitors', (req, res) => {
    res.json(visitorInfo);
});

/* /api/visitors page */










/* Start server */
const port = 3333;
app.listen(port, () => {
    console.log(`The server is running on port ${port}.`);
});