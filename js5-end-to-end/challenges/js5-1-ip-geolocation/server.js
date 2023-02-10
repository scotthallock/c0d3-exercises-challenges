/* Set up express, body-parser, and EJS */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
app.set('view engine', 'ejs');

/* Global variables */ 
const visitorInfo = []; // data to send when '/api/visitors' is requested
const visitorIPs = []; // used to track new vs. repeat visitors
const locFrequency = {}; // key: location | value: visitor count
const cityPageFrequency = {} // key: location | value: how many times the page has been visited
let visitorsHTML = '';

let dataToSend = {};

/* Request for home page */
app.get('/', (req, res) => {
    console.log('OUCH - home');
    res.render('pages/home');
});

/**
 * Middleware for GET or POST requests to /visitors page.
 * For both a GET and POST request, we need to:
 * 1) get the client's IP
 * 2) use that to get their approximate location
 * 3) store their information in the global variables
 * 4) package data which will be sent back in a response
 * 
 * We need jsonParser passed in as the second argument to help us
 * parse the body from a POST request.
 */
app.use('/visitors', jsonParser, (req, res, next) => {
    console.log(`The ${req.method} request went through the middleware function`)
    /**
     * In a POST request, the IP will be in the body.
     * In a GET request, the IP will be in:
     *  - the 'x-forwaded-for' header, or
     *  - req.socket.remoteAddress
     */
    let clientIP;
    if (req.method === 'POST') clientIP = req.body.ip;
    else clientIP = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress;
    
    /* If the IP address is new, add it visitorIPs */
    let isNewVisitor = false;
    if (!visitorIPs.includes(clientIP)) {
        visitorIPs.push(clientIP);
        isNewVisitor = true;
    }

    /* Make a request to this API to get location of user */
    fetch(`https://js5.c0d3.com/location/api/ip/${clientIP}`)
        .then(res => res.json())
        .then(data => {
            const loc = data.cityStr;
            const [lat, lng] = data.ll;

            /* Store new visitor's information */
            /* This is the API we are creating */
            if (isNewVisitor) {
                visitorInfo.push({
                    id: visitorIPs.length, // one unique id per unique ip
                    timeOfFirstVisit: Date.now(),
                    location: loc,
                    coordinates: [lat, lng]
                })
            }

            /* Track the frequency of visitors from this location */
            locFrequency[loc] = (locFrequency[loc] || 0) + 1;

            /* Create HTML to display freqency of visitors */
            visitorsHTML = Object.keys(locFrequency).reduce((acc, loc) => {
                return acc + `
                <h3><a href="/city/${loc}">${loc} - ${locFrequency[loc]}</a></h3>
                `
            }, '');

            /* Package the important data to send back to client */
            dataToSend = {
                location: loc,
                lat: lat,
                lng: lng,
                visitorsHTML: visitorsHTML
            };

            next(); // Go to the GET or POST handler
        })
        .catch(error => {
            return console.error(error);
        });
});


/* (GET) Request for /visitors page */
app.get('/visitors', (req, res) => {
    console.log('OUCH - visitors (GET) ', Date.now());
    res.render('pages/visitors', dataToSend); // datatoSend has our EJS template variables
});


/* (POST) Request for /visitors page (when user clicks a button) */
app.post('/visitors', (req, res) => {
    console.log('OUCH - visitors (POST) ', Date.now());
    res.json(dataToSend); // the client will parse this data and update the DOM
});

/* Request for /city page */
app.get('/city/:location', (req, res) => {
    const loc = req.params.location;

    /* count another visit to this page */
    cityPageFrequency[loc] = (cityPageFrequency[loc] || 0) + 1;

    const coordsOfCity = visitorInfo.find(e => e.location === loc).coordinates;
    const [lat, lng] = coordsOfCity;

    res.render('pages/city', {
        location: loc,
        pageVisitCount: cityPageFrequency[loc], // additional property needed for /city page
        lat: lat,
        lng: lng,
        visitorsHTML: visitorsHTML
    });
});

/* Request for /api/visitors page */
app.get('/api/visitors', (req, res) => {
    res.json(visitorInfo);
});

/* Start server */
const port = 3333;
app.listen(port, () => {
    console.log(`The server is running on port ${port}, starting at ${new Date()}`);
});