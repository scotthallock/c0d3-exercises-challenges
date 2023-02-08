const express = require('express');
const app = express();

// http://localhost:3333/users/scotth/profile/123
app.get('/users/:username/profile/:age/', (req, res) => {
    /**
     * IMPORTANT req PARAMETERS TO KNOW
     */
    console.log('ouch', Date.now());
    console.log(req.params); // { username: 'scotth', age: '123' }
    console.log(req.query); // {}
    console.log(req.hostname); // localhost
    console.log(req.ip); // ip address
    console.log(req.headers); // usually we will access headers with the req.get() function, not this
    console.log(req.body); // body of incoming request (PUT, PATCH, POST) will have body

    /* IMPORTANT req FUNCTIONS */
    console.log(req.get('authorization')); // return the value in the authorization header
    /* the ip address of the original machine that sent the request
       if the request went thorugh a proxy */
    console.log(req.get('x-forwarded-for'));

    /**
     * IMPORTANT res FUNCTIONS TO KNOW
     */
    res.send(); // takes in a string and sets it as the response body and sends the response
    res.status(400).send('wrong input'); // status defaults to 200
    /* takes in a url string, sets response status code to 302 - redirection
       when the browser recieves the response, it sends a new request to the url specified */
    res.redirect('https://google.com');
    /* set a response header, two ways to use */
    res.set('set-cookie', 'hello'); // two string parameters
    res.set({ // key-value pairs in an object, if we want to set multiple headers
        'set-cookie': 'hello',
        'cache-control': 'max-age=120'
    });
    /* sets the response header content-type to JSON and sends back a JSON string.
       usually used for APIs to send back data */
    res.json([
        {
            title: 'lesson1'
        },
        {
            title: 'lesson2'
        }
    ]);
    /* send a file, like an image. make sure it exists! */
    res.sendFile('./funny.png');


    const userId = req.params.username;
    const userAge = req.params.age;
    res.send(`
    <h1>Hello, you are ${userId} and your age is ${userAge}<h1>
    `);
})

/**
 * Important properties to know in the request object:
 * 
 * req.params - object with variables in the URL
 * 
 * req.query - object with url query parameters
 * 
 * req.hostname - hostname in the url
 * 
 * 
 */



const port = 3333;
app.listen(port);
console.log('Server stated at http://localhost:' + port);