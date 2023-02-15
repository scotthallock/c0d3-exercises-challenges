const express = require('express');
const app = express();

app.get('/chatroom', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});






app.listen(3333, () => {
    console.log('Server is running on port 3333....');
});