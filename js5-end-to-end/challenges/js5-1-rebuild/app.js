/**
 * Rebuild of IP Geolocation
 */
const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();

/* Global variables */
const visitorAPI = []; // data to send when '/api/visitors' is requested
const visitorIPs = []; // used to track new vs. repeat visitors
const locFrequency = {}; // key: location | value: visitor count
const cityPageFrequency = {} // key: location | value: how many times the page has been visited

/* Request for home page */
app.get('/ip-geolocation', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/* Get the location from the client IP, and log a visit from that location */
app.use('/ip-geolocation/visitors', jsonParser, (req, res, next) => {
    /* Get the client IP address */
    let clientIP;
    if (req.method === 'POST') {
        clientIP = req.body.ip;
    } else {
        clientIP = req.headers['x-forwarded-for'] ?? req.socket.remoteAddress;
    }

    /* If the IP address is new, add it to visitorIPs */
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
            /* Store the new visitor's information */
            if (isNewVisitor) {
                visitorAPI.push({
                    id: visitorIPs.length, // one unique id per unique ip
                    timeOfFirstVisit: Date.now(),
                    location: loc,
                    coordinates: [lat, lng]
                })
            }
            /* Track frequency of visitors from this location */
            locFrequency[loc] = (locFrequency[loc] || 0) + 1;
            res.status(200).json({
                loc,
                lat,
                lng,
                locFrequency
            });
        })
        .catch(console.error);
});

/* Log a visit to the page of a particular location */
app.get('/ip-geolocation/city/:location', (req, res) => {
    const loc = req.params.location;
    /* Count another visit to this location's page */
    cityPageFrequency[loc] = (cityPageFrequency[loc] || 0) + 1;
    /* Get coordinates to render google map */
    const coordsOfCity = visitorAPI.find(e => e.location === loc).coordinates;
    const [lat, lng] = coordsOfCity;
    res.status(200).json({
        loc,
        lat,
        lng,
        locFrequency,
        cityPageFrequency: cityPageFrequency[loc]
    });
});

/* Request for /api/visitors page */
app.get('/ip-geolocation/api/visitors', (req, res) => {
    res.json(visitorAPI);
});

/* Start server */
app.listen(3333, () => {
    console.log('Server is running on port 3333...');
});