const express = require("express");
const app = express();

// Middleware to make sure every request has a cookie in order
//   to access the profile page.
app.get(
    "/profile",
    (req, res, next) => {
        if (!req.get("cookie")) {
            return res
                .status(401)
                .send("You are not authorized to visit this page");
        }
        next();
    },
    (req, res) => {
        const username = req.get("cookie");
        res.send(`<h1> Welcome ${username}!</h1>`);
    }
);


/* count users who visited */
let count = 0
app.get('/', (req, res, next) => {
  req.user = {
    id: count
  }
  count = count + 1
  next()
})

app.get('/', (req, res) => {
  res.send(`<h1> You are visitor number ${req.user.id}!</h1>`)
})


/* create a path for every file in your public folder */
app.use(express.static('./public'));
/**
 * the use function accepts two parameters, the path and a callback function
 * if the path is missing, this function will run on a request to ALL paths
 * 
 * therefore, invoking a static function should return a function
 * 
 * if we put a file called c0d3.svg in a /public folder
 * and we make a request to:
 *   localhost:3333/c0d3.svg
 * we will see this image in our browser
 */

app.listen(3333);
console.log('Your server has started on port 3333');
