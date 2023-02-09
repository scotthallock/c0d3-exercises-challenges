const express = require('express');
const app = express();

const timeLastSeen = {}; // keys are users, values are the time last seen
app.get('/online', (req, res) => {
    if (!req.query.name) {
        return res.status(401).send('You must enter a name query parameter.')
    }
    const name = req.query.name;
    timeLastSeen[name] = Date.now();

    /**
     * The body (HTML) we are sending back will include a script
     * This script will, once per second, try to fetch a resource from the server
     * 
     * The fetch function is making a GET request to this server, at the /users path
     * so we need to write a function to handle that.
     */
    res.send(`
    <h1>Welcome ${name}</h1>
    <p>Open this page in another tab, use a different name!</p>
    <h2>Users online:</h2>
    <div id="other-users">

    </div>
    <script>
    const getData = () => {
        fetch('./users?name=${name}')
            .then(res => res.json()) // parse the response
            .then(data => { // data 
                console.log(data); // data is an object
                const usersOnline = Object.keys(data).reduce((acc, user) => {
                    return acc + '<p>' + user + ' ... ' + data[user] + '</p>'
            }, '');

        document.getElementById('other-users').innerHTML = usersOnline; // render the data on screen

        setTimeout(() => {
            getData(); // recursively call the function wrapping the fetch()
        }, 1000); // once per second
        })
    };
    getData();
    </script>
    `);

});

app.get('/users', (req, res) => {
    const authorName = req.query.name;
    timeLastSeen[authorName] = Date.now(); // update the user that sent the request
    Object.keys(timeLastSeen).forEach(user => {
        /* if the user hasn't been seen in 5 seconds, remove the user */
        if (timeLastSeen[user] < Date.now() - 5000) {
            delete timeLastSeen[user];
        }
    });
    res.json(timeLastSeen); // send a JSON string of our users object

})

app.listen(3333);
console.log('Your server is running at localhost:3333');