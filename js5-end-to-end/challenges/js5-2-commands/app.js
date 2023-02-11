const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const child_process = require('child_process');
const { stderr } = require('process');

/**
 * Create a route /commands that takes in an input box that
 * lets you execute commands directly on your server. You
 * must be able to see the response on the page.
 * 
 * Use execFile or spawn function from Node's child_process
 * library to execute the command.
 * 
 * To protect your code from malicious users, you should only
 * allow these commands: ls, cat, pwd.
 * 
 * P.S.: The child_process library also includes a exec
 * function which takes a string containing the entire
 * command to execute. This potentially may be used to
 * trigger arbitrary command execution, and so, it's a
 * unsafer alternative.
 */

// const child = spawn('pwd');
// console.log(child);

/* Serve the home page */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/');
});


/* Request handler for when user inputs a command */
app.post('/', jsonParser, (req, res) => {
    const input = req.body.command.trim().split(' ');
    const command = input[0];
    const options = input.slice(1);

    if (command !== 'ls' &&
        command !== 'cat' &&
        command !== 'pwd') {
        console.log('Not a supported command.');
        return res.send('Not a supported command.');
    }
    
    const child = child_process.spawn(command, options);

    child.stdout.on('data', data => {
        return res.json(data.toString());
    });
      
    child.stderr.on('data', data => {
        return res.json(data.toString());
    });

    child.on('error', error => {
        return res.json(error.message);
    });
});

app.listen(3333, () => {
    console.log('The server has started on port 3333.')
});