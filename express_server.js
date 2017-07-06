
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// Shortened URL database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Registered user database
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
}

// Random string generator
function generateRandomString() {
  const charSet = 'abcdefghijklmnopqrstuv123456789';
  let randomString = '';
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 31);
    randomString += charSet[randomNum]
  }
  return randomString;
}

// --> Server Responses <-- //

// User login
app.post("/urls/login", (req, res) => {
  let name = req.body;
  res.cookie('username', name['username']);
  res.redirect(301, "/urls/");
})

// User logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(301, "/urls/");
})

// User registration page
app.get("/urls/register", (req, res) => {
  res.render("urls_register")
})

// User registration w/ error handler
app.post("/urls/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body['email'];
  let password = req.body['password'];
  if (!email || !password) {
    res.sendStatus(400);
  } else if (email && password) {
    for (prop in users) {
      if (email === users[prop]['email']) {
        res.sendStatus(400);
      } else {
        users[id] = {
          'id': id,
          'email': email,
          'password': password
        }
        res.cookie('user_id', id);
        res.redirect(301, "/urls/");
      }
    }
  }
})

// Home Page
app.get("/", (req, res) => {
  res.end("Welcome to tinyAPP!");
})

// Urls list page
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})

// URL submission page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
  };
  res.render("urls_new", templateVars);
})

// URL submission handler
app.post("/urls", (req, res) => {
  let newURL = req.body['longURL'];
  let shortenedURL = generateRandomString();
  urlDatabase[shortenedURL] = newURL;
  res.redirect(301, "/urls/");     // redirects to list rather than specified url
  // res.redirect(301, "/urls/" + shortenedURL)
})

// Button to delete url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(301, "/urls/");
})

// Redirect to URL website (Currently through short URL link)
app.get("/urls/:shortURL/redirect", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

// URL update page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
})

// URL update handler
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect(301, "/urls/");
})

// --> Port Listener & Error Handler <-- //

// Error handler
app.use(function(err, req, res, next){
  console.error(err.stack);
  es.status(500).send('Something broke!');
})

// Port listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})



// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
