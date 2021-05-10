// set localhost server on port 8080 using express
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

// set ejs as a view engine & set body parser
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req,res) => {
  res.send('Hello!');
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

// new route handler for /urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// GET route to show the form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// second route and handler to pass in long url and return its shortened form
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// set server listening on specified port

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generating random AlphaNumeric string
const generateRandomString = function() {
  const random = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(random[Math.floor(Math.random() * random.length)]);
  }
  arr = arr.join('');
  return arr;
};
