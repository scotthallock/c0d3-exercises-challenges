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


/* Request for home page */
app.get('/', (req, res) => {
    console.log('OUCH - home');
    res.render('pages/home');
});


/* (GET) Request for /visitors page */
app.get('/visitors', (req, res) => {
    console.log('OUCH - visitors (GET) ', Date.now());

    /* Get the client IP address */
    const clientIP = req.get('x-forwarded-for');
    
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
            // if (data.error) throw new Error(data.error);

            const loc = data.cityStr;
            const [lat, lng] = data.ll;
            console.log('The lat and lng is: ', lat, lng)

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

            res.render('pages/visitors', {
                location: loc,
                lat: lat,
                lng: lng,
                visitorsHTML: visitorsHTML
            });


        })
        .catch(error => {
            return console.error(error);
        });
});


/* (POST) Request for /visitors page */
/* When the user clicks a button, a POST request is made. */
/* The body contains the fake client ip.  */
app.post('/visitors', jsonParser, (req, res) => { // body-parser used here to parse the POST body
    console.log('OUCH - visitors (POST) ', Date.now());
    const clientIP = req.body.ip;
    
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
            // if (data.error) throw new Error(data.error);

            const loc = data.cityStr;
            const [lat, lng] = data.ll;
            console.log('The lat and lng is: ', lat, lng)

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

            /* send a JSON to the client */
            /* the client will parse it and update DOM accordingly */
            res.json({
                location: loc,
                lat: lat,
                lng: lng,
                visitorsHTML: visitorsHTML
            });


        })
        .catch(error => {
            return console.error(error);
        });
    
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
        pageVisitCount: cityPageFrequency[loc],
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