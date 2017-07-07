
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

// URL database
let urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userID: "lx4b2e"},
  "9sm5xK": { url: "http://www.google.com", userID: "b3r25f" }
};

// Registered user database
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

// Random string generator
function generateRandomString() {
  const charSet = 'abcdefghijklmnopqrstuv123456789';
  let randomString = '';
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 31);
    randomString += charSet[randomNum]
  }
  return randomString;
};


// --> Server Responses <-- //


// -> User Infrastructure //

// User registration page
app.get("/urls/register", (req, res) => {
  res.render("urls_register");
})

// User registration handler
app.post("/urls/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body['email'];
  let password = req.body['password'];
  let hashedPassword = bcrypt.hashSync(password, 10);
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
          'password': hashedPassword
        }
        req.session.user_id = id;
        res.redirect("/urls/");
      }
    }
  } else {
    res.sendStatus(404);
  }
})

// User login page
app.get("/urls/login", (req, res) => {
  res.render("urls_login");
})

// User login handler
app.post("/urls/login", (req, res) => {
  let id = generateRandomString();
  let email = req.body['email'];
  let password = req.body['password'];
  if (!email || !password) {
    res.sendStatus(400);
  } else if (email && password) {
    for (prop in users) {
      if (email === users[prop]['email'] && bcrypt.compareSync(password, users[prop]['password'])) {
        req.session.user_id = users[prop]['id'];
        res.redirect("/urls/");
      }
    }
  } else {
    res.sendStatus(404);
  }
})

// User logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect("/urls/");
})


// -> Site Infrastructure //

// Landing page
app.get("/", (req, res) => {
  res.render("landingPage");
})

// Urls list page
app.get("/urls/", (req, res) => {
  let templateVars = {
    user_id: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
})

// Button to delete url from database
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
})

// URL creation page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login");
  }
})

// URL creation handler
app.post("/urls/", (req, res) => {
  let newURL = req.body['longURL'];
  let shortenedURL = generateRandomString();
  urlDatabase[shortenedURL] = {};
  urlDatabase[shortenedURL]['url'] = newURL;
  urlDatabase[shortenedURL]['userID'] = req.session.user_id;
  res.redirect("/urls/");
})

// URL update page
app.get("/urls/:id/edit", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: users[req.session.user_id]
  };
  if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls/");
  }
})

// URL update handler
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id]['url'] = req.body['longURL'];
  res.redirect("/urls/");
})

// Redirect to URL website (Currently through short URL link)
app.get("/urls/:shortURL", (req, res) => {
  let id = urlDatabase[req.params.shortURL];
  res.redirect(id['url']);
})


// --> Port Listener & Error Handler <-- //

// Error handler
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

// Port listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})
