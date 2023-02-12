const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();
const child_process = require('child_process');
const { stderr } = require('process');

/* Serve static files (such as images) */
app.use(express.static(__dirname + '/'));

/* Serve the home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/');
});


/* Request handler for when user inputs a command */
app.post('/', jsonParser, (req, res) => {
    /* remove extra spaces from input and split */
    const input = req.body.command.replace(/\s+/g,' ').trim().split(' ');
    const command = input[0];
    const options = input.slice(1);

    const red = '#FF0000';
    const white = '#FFFFFF';

    if (command === 'git' && options[0] !== 'status') {
        return res.json({
            color: red,
            message: `only 'git status' is available`
        });
    }
    if (command !== 'ls' &&
        command !== 'cat' &&
        command !== 'pwd' &&
        command !== 'git') {
        return res.json({
            color: red,
            message: `'${command}' is not a supported command`
        });
    }
    
    const child = child_process.spawn(command, options);

    child.stdout.on('data', data => {
        console.log('stdout ', data.toString());
        return res.json({
            color: white,
            message: data.toString()
        });
    });
      
    child.stderr.on('data', data => {
        console.log('stderr ', stderr.toString());
        return res.json({
            color: red,
            message: data.toString()
        });
    });

    child.on('error', error => {
        console.log('error ', error.message);
        return res.json({
            color: red,
            message: error.message
        });
    });
});

app.listen(3333, () => {
    console.log('The server has started on port 3333 ', Date.now());
});