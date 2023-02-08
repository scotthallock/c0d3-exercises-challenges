const express = require('express');
const app = express();

/* depending on the browser, send a response in red or blue */
/* chrome: red, firefox: blue, other: green */
app.get('/whichbrowser', (req, res) => {
    console.log('/whichbrowser', Date.now());
    const ua = req.get('User-Agent').toLowerCase();
    if (ua.includes('chrome/')) {
        res.send(`<h1 style="color:red">You are using Chrome</h1>`);
    } else if (ua.includes('firefox/')) {
        res.send(`<h1 style="color:blue">You are using Firefox</h1>`);    
    } else {
        res.send(`<h1 style="color:green">You are using another browser</h1>`);
    }   
});

/* CORS: allow browsers in other domains to send a request to your server
   for all /api/* paths. This would be an options request. */
app.options('/api/*', (req, res) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Credentials'
    )
    res.send('ok');
});

app.put('/api/*', (req, res) => {
    res.send('<h1>put request received</h1>')
});

app.post('/api/*', (req, res) => {
    res.send('<h1>post request received</h1>')
});

/* Show how many distinct users have visited a site - use cookies to track */
const {v4 : uuid} = require('uuid'); // universally unique identifier (UUID) 

let uniqueVisitors = 0;
app.get('/distinct', (req, res) => {
    const cookie = req.get('cookie') || '';
    console.log({cookie}); // the first time, empty string
                           // the second time, something like 'guid=85b8805a-dcec-442e-85fd-07839973d77e'
    const cookieStr = cookie.split(';').find(str => { // cookies are separated by ';'
        return str.includes('guid=');
    }) || '';
    console.log({cookieStr});

    let guid = cookieStr.split('=')[1]; // get what's after "guid="
    if (cookieStr) {
        return res.send(`
          <h1>You have been identified with guid ${guid}</h1>
          <h3>Distinct Number of Visitor Count: ${uniqueVisitors}.</h3>
        `)
    };
    uniqueVisitors += 1;
    guid = uuid(); // generate a uuid string
    res.set('set-cookie', `guid=${guid}`); // we put "guid=" in front so we know what this cookie means
    res.send(`
    <h1>You have been ASSIGNED a guid ${guid}</h1>
    <h3>Distinct Number of Visitor Count: ${uniqueVisitors}.</h3>
    `);
});


/* A/B testing - 1 in 3 visitors will always see 'Hello World' in red.
   The rest will see it in blue. */

/* These arrays will store guids */
const aUsers = []; // 'a' experience will be red (1 in 3 users)
const bUsers = []; // 'b' experience will be blue (2 in 3 users)

app.get('/abtest', (req, res) => {
    console.log({aUsers, bUsers});
    const cookie = req.get('cookie') || '';
    console.log({cookie});
    const cookieStr = cookie.split(';').find(str => {
        return str.includes('guid=');
    }) || '';
    
    let guid = cookieStr.split('=')[1]; // get what's after 'guid='
    /* if there is a guid already */
    if (cookieStr) {
        if (aUsers.includes(guid)) {
            res.send('<h1 style="color:red">Hello, you are an A-experience user.</h1>');
        } else if (bUsers.includes(guid)) {
            res.send('<h1 style="color:blue">Hello, you are an B-experience user.</h1>');
        } else {
            res.send('<h1>We could not identify you as an A or B user...</h1>');
        }
        return;
    }

    /* if there is not a guid, set one */
    guid = uuid();
    res.set('set-cookie', `guid=${guid}`);
    
    /* assign the new visitor to the 'a' or 'b' experience */
    if (bUsers.length >= aUsers.length * 2) { // if there are more than twice as many bUsers
        aUsers.push(guid);
        res.send(`
            <h1>Hello new visitor.</h1>
            <h1 style="color:red">Hello, you are an A-experience user.</h1>
        `);
    } else {
        bUsers.push(guid);
        res.send(`
            <h1>Hello new visitor.</h1>
            <h1 style="color:blue">Hello, you are an B-experience user.</h1>
        `);
    }
    
});

/* another way of doing it, without using uuid */
let visitorId = 0;
router.get('/ab', (req, res) => {
    const cookie = req.get('cookie') || ''
    const cookieStr = cookie.split(';').find(str => {
        return str.includes('abtest=')
    }) || '';

    let visitorKey = cookieStr.split('=')[1]
    if (!visitorKey) {
        visitorKey = visitorId;
        visitorId = visitorId + 1;
    }
     let color = '#2a2'
    if (+visitorKey % 3 === 0) {
        // happens 1 every 3 times
        color = '#a22'
    }
    res.set('set-cookie', `abtest=${visitorKey}`); // assign a new cookie
    res.send(`
    <style>
    h1 {
    color: ${color};
    }
    </style>
    <h1>Hello World</h1>
    `);
});






const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);