const express = require('express');
const app = express();

const messages = [];
app.get('/messages', (req, res) => {
    
    const message = req.query.message;;
    if (!message) {
        return res.status(400).send('Please provide a message query parrameter.')
    }
    messages.push(message);
    
    res.send(`
    <ul>
    ${messages.reduce((acc, e) => {
        return acc + '<li>' + e + '</li>';
    }, '')}
    </ul>
    `);
});

app.listen(3333);
console.log('server started at localhost:3333');