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


app.listen(3000);