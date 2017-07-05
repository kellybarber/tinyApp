
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// An object to represent the database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Function to create random strings used as shortened urls
function generateRandomString(fullAddress) {
  const charSet = 'abcdefghijklmnopqrstuv123456789';
  let randomString = '';
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 31);
    randomString += charSet[randomNum]
  }
  return randomString;
}

// Home Page
app.get("/", (req, res) => {
  res.end("Welcome to tinyAPP!");
})

// Urls list page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

// Page to submit new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

// Post request adding short and long url to the database
app.post("/urls", (req, res) => {
  let newURL = req.body['longURL'];
  let shortenedURL = generateRandomString(newURL);
  urlDatabase[shortenedURL] = newURL;
  res.redirect(301, "/urls/")     // redirects to list rather than specified url
  // res.redirect(301, "/urls/" + shortenedURL)
})

// Button to delete url from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(301, "/urls/");
})

// Redirect to website after adding short url
// app.get("/urls/:shortURL", (req, res) => {
//   let longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// })

// Fallback request for unknown filepath
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
})

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect(301, "/urls/")
})


// Error handler
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

// Port listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})




// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
