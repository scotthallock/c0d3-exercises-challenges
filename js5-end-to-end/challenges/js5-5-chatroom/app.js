const express = require('express');
const jsonParser = require('body-parser').json();
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);
const app = express();

class Chatroom {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.messages = [];
    }

    addMessage(user, time, message) {
        this.messages.push({
            user,
            time,
            message
        });
        /* Only store last 100 messages */
        if (this.messages.length >= 100) {
            this.messages.shift();
        }
    }

    getMessages() {
        /* return messages with 'time ago' timestamps */
    }
}


// could I create a chatroom class for this?
const allChatrooms = {
    'Cat facts': {
        description: 'All things about cats',
        messages: []
    },
    'Shakespeare quotes': {
        decsription: 'Only the best',
        messages: []
    },
    'Gamers': {
        decsription: 'Waddup',
        messages: []
    }
};

/* Middleware: get user data (username, email, etc.) from the JSON Web Token (JWT) */
/* Every request to this server MUST include an 'Authorization' header */
/* This middleware will set the user data into the request object */
app.use('/chatroom/*', (req, res, next) => {
    fetch('https://js5.c0d3.com/auth/api/session', {
        headers: {
            Authorization: req.get('Authorization')
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            /**
             * Set the data into the request object.
             * The data object will look like this...
             *     {username: '...', name: '...', email: '...', id: '...', jwt: '...'}
             * Or like this...
             *     {data: {message: 'Not logged in'}}
             */
            req.user = data;
            next();
        })
        .catch(console.error);
});

/* Send the user data that was set in the middleware */
app.get('/chatroom/api/session', (req, res) => {
    return res.status(200).json(req.user);
});

/* Send index.html */
app.get('/chatroom', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/* Check if the chatroom in the url exists, then send index.html */
app.get('/chatroom/:room', (req, res) => {
    // const roomExists = allChatrooms.some(room => {
    //     return room.name === req.params.room;
    // });
    const roomExists = Object.keys(allChatrooms).some(e => e === req.params.room);
    if (!roomExists) {
        return res.status(404).send(`This chatroom doesn't exist.`);
    }
    res.sendFile(__dirname + '/index.html');
});


/* Get the all the messages in the chatroom */
app.get('/chatroom/api/:room/messages', (req, res) => {
    console.log('getting messages ouch ', Date.now());

    const room = req.params.room;

    if (!allChatrooms[room]) return console.log('Trying to get messages from a room that does not exist...');

    /* Return the messages array, but replace timestamps 
       with fuzzy timestamps */
    const messages = allChatrooms[room].messages.map(e => {
        return {
            user: e.user,
            time: dayjs(e.time).fromNow(), // time ago
            message: e.message
        };
    });

    res.status(200).json(messages);
});

/* Post a message in the chatroom */
app.post('/chatroom/api/:room/messages', jsonParser, (req, res) => {
    console.log('posting message ouch ', Date.now());
    // what happens if req.user is error?

    const room = req.params.room;
    const user = req.user.username;
    const time = req.body.time;
    const message = req.body.message;

    if (!allChatrooms[room]) return console.log('Trying to post a message in a room that does not exist...');

    /* Add the message */
    allChatrooms[room].messages.push({
        user,
        time,
        message
    });
    console.log(allChatrooms[room].messages);

    res.sendStatus(200);
});

/* Send chatroom names and descriptions to client */
app.get('/chatroom/api/rooms', (req, res) => {
    // send back an array containing
    // the name and decsription of each chatroom
    const data = Object.keys(allChatrooms).map(room => {
        return {
            name: room,
            description: allChatrooms[room].description
        };
    });
    res.status(200).json(data);
});

/* Create a new chatroom */
app.post('/chatroom/api/rooms', jsonParser, (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    /* If a room with that name already exists, reject it */
    const isDuplicate = Object.keys(allChatrooms).some(e => {
        return e.toLowerCase() === name.toLowerCase();
    });
    if (isDuplicate) {
        console.log('Duplicate name');
        return res.status(400).json({error: {message: 'Room with that name already exists.'}})
    }
    /* Add the new chatroom */
    allChatrooms[name] = {
        description,
        messages: []
    };
    res.status(200).json('OK');
});

const shakespeareQuotes = require('./shakespeare');
const shakespeareBots = ['ShakespeareBot1', 'ShakespeareBot2', 'ShakespeareBot3'];

/* returns a random element from the input array */
const randElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Shakespeare bot - posts in the #Shakespeare room every few seconds
const shakespeareBotPost = () => {
    allChatrooms['Shakespeare quotes'].messages.push({
        user: randElement(shakespeareBots),
        time: Date.now(),
        message: randElement(shakespeareQuotes)
    })
    setTimeout(shakespeareBotPost, 1000 * 5);
};
shakespeareBotPost();


/* Start server */
app.listen(3333, () => {
    console.log('Server is running on port 3333....');
});