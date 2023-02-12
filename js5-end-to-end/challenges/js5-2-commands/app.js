const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();
const child_process = require('child_process');

/* Serve static files (such as images) */
app.use(express.static(__dirname + '/'));

/* Serve the home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/* Request handler for when user inputs a command */
app.post('/', jsonParser, (req, res) => {
    /* remove extra spaces from input and split */
    const input = req.body.command.replace(/\s+/g,' ').trim().split(' ');
    const command = input[0];
    const options = input.slice(1);
    const allowedCommands = ['cat', 'ls', 'pwd', 'git'];

    /* if the command is empty or not allowed */
    if (!allowedCommands.includes(command)) {
        return res.status(400).json({
            color: "red",
            message: command === '' ?
                'please enter a command' :
                `'${command}' is not a supported command`
        });
    }
    if (command === 'cat' && options.length === 0) {
        return res.status(400).json({
            color: "red",
            message: `'cat' requires 1 or more options`
        });
    }
    if (command === 'git' && options[0] !== 'status') {
        return res.status(400).json({
            color: "red",
            message: `only 'git status' is available`
        });
    }
    
    /* create child process */
    const child = child_process.spawn(command, options);
    let result = '';

    /* child process listeners */
    child.stdout.on('data', (data) => {
        result += data.toString();
    });
    child.stderr.on('data', (data) => {
        result += data.toString();
    });
    child.on('error', error => {
        result = error.message;
    });
    /* wait for child process to close to send result */
    child.on('close', code => {
        /* code === 0 means normal exit */
        console.log({input, code, result});
        res.json({
            color: code === 0 ? "white" : "red",
            message: result
        });
    });

});

/* Start the server */
app.listen(3333, () => {
    console.log('Server is running... ', new Date());
});