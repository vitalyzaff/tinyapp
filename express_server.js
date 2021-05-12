// set localhost server on port 8080 using express
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// set ejs as a view engine & set body parser
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// url database in form of object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// users database
const usersDb = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// *****************************************************************************************************************************************

app.get('/', (req,res) => {
  res.redirect('/urls');
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// route definition for form submission
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body['longURL'];
  res.redirect(`/urls/${randomString}`);
});

// redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// new route handler for /urls
app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// GET route to show the form
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_new', templateVars);
});

// second route and handler to pass in long url and return its shortened form
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
// delete an object key
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// update the link and redirect to main page
app.post('/urls/:shortURL/edit', (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// link to edit particular link
app.post('/urls/:shortURL/', (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// set cookie and pass username to it
app.post('/login', (req, res) => {
  const user = req.body.username;
  res.cookie('username', user);
  res.redirect('/urls');
});
// user logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// registration page
app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render('urls_register', templateVars);
});

// *****************************************************************************************************************************************



// set server listening on specified port

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generating random AlphaNumeric string
const generateRandomString = function() {
  const random = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(random[Math.floor(Math.random() * random.length)]);
  }
  arr = arr.join('');
  return arr;
};
