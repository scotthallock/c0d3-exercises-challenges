const express = require('express');
const app = express();

app.get('/delayed', (req, res) => {
    const delay = req.query.time;
    setTimeout(() => {
        res.send(`<h1>After ${delay} milliseconds, I'm here!</h1>`)
    }, delay);
});

app.listen(3333);
console.log('Your server has started at localhost:3333');