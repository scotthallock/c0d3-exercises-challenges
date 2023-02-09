/* Set up express */
const express = require('express');
const app = express();

/* Global variables */ 
const visitorInfo = []; // data to send when '/api/visitors' is requested
const visitorIPs = []; // used to track new vs. repeat visitors
const locFrequency = {}; // key: location | value: visitor count

/**
 * Send the HTML file.
 * It includes a script that will make a request to /visitors
 * to get the user's location based of the client IP address.
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/* The HTML file includes a script which */
app.get('/visitors', (req, res) => {
    console.log('/visitors ouch', Date.now());

    /* Get the user's ip address */
    const clientIP = req.get('x-forwarded-for');

    /* If the IP address is new, log new visitor information */
    let isNewVisitor = false;
    if (!visitorIPs.includes(clientIP)) {
        visitorIPs.push(clientIP);
        isNewVisitor = true;
    }

    /* Make a request to this c0d3's API to get location of user */
    fetch(`https://js5.c0d3.com/location/api/ip/${clientIP}`)
        .then(res => res.json())
        .then(data => {
            /* store the new visitor's information */
            if (isNewVisitor) {
                visitorInfo.push({
                    id: visitorIPs.length,
                    timeOfFirstVisit: Date.now(),
                    location: data.cityStr,
                    coordinates: data.ll
                });
            }

            /* Keep track of where the visitors come from */
            const loc = data.cityStr;

            /* Increment the visitor count from this location */
            locFrequency[loc] = (locFrequency[loc] || 0) + 1;

            /* Create HTML to display vistor location frequency */
            const visitorsHTML = Object.keys(locFrequency).reduce((acc, loc) => {
                return acc + `
                <h3><a href="/city/${loc}">${loc} - ${locFrequency[loc]}</a></h3>
                `
            }, '');

            /* Send data back to client */
            res.json({
                location: data.cityStr, // city, region, country
                lat: data.ll[0], // latitude
                lng: data.ll[1], // longitude 
                visitorsHTML: visitorsHTML
            });
        })
});

/**
 * display the google map for this location,
 * a list of the cities
 * and the count of visits to this page
 */
const visitCount = {};
app.get('/city/:location', (req, res) => {
    const loc = req.params.location;
    visitCount[loc] = (visitCount[loc] || 0) + 1;
    res.send(`
    <h1>You are visiting the page for ${loc}<h1>
    <h1>${visitCount[loc]} users have visited this page.</h1>`)
});



app.get('/api/visitors', (req, res) => {
    console.log('/api/visitors ouch', Date.now());
    res.json(visitorInfo); 
});



const port = 3333;
app.listen(port);
console.log(`Your server is running on http://localhost:${port}`);