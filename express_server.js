// set localhost server on port 8080 using express
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { generateRandomString, checkEmail, checkPass, createUser, urlsForUser } = require('./helpers');


// set ejs as a view engine
app.set("view engine", "ejs");

// body parser middleware
app.use(bodyParser.urlencoded({extended: true}));

// cookie session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// ************************************************************ URL DATABASE **********************************************************

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


// ************************************************************ USER DATABASE **********************************************************

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

// redirect to urls page
app.get('/', (req,res) => {
  res.redirect('/urls');
});


// if not logged in, redirects to login page
app.get('/urls', (req, res) => {
  const id = req.session['userID'];
  if (!id) {
    res.redirect('/login');
  }
  const usrURLs = urlsForUser(id, urlDatabase);
  const templateVars = { userID: usersDb[id], urls: usrURLs };
  res.render('urls_index', templateVars);
});

// route definition for url submission
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  const longURL = req.body['longURL'];
  const userID = req.session['userID'];
  urlDatabase[randomString] = { longURL, userID };
  res.redirect(`/urls/${randomString}`);
});

// redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});



// form to submit new link
app.get('/urls/new', (req, res) => {
  const id = req.session['userID'];
  if (!id) {
    res.redirect('/login');
  }
  const templateVars = { userID: usersDb[id]};
  res.render('urls_new', templateVars);
});

// second route and handler to pass in long url and return its shortened form
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session['userID'];
  const { shortURL } = req.params;
  if (id !== urlDatabase[shortURL]['userID']) {
    res.status(400).send('not authorized');
  }
  const templateVars = { userID: usersDb[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// delete an object key
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session['userID'];
  const { shortURL } = req.params;
  if (id === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send('not authorized');
  }
});

// update the link and redirect to main page
app.post('/urls/:shortURL/edit', (req, res) => {
  const id = req.session['userID'];
  const { shortURL } = req.params;
  if (id !== urlDatabase[shortURL]['userID']) {
    res.status(400).send('not authorized');
  }
  const longURL = req.body['longURL'];
  urlDatabase[shortURL] =  { longURL, userID: id };
  res.redirect('/urls');
});

// link to edit particular link
app.post('/urls/:shortURL/', (req, res) => {
  const id = req.session['userID'];
  const templateVars = { userID: usersDb[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// user logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// registration page
app.get('/register', (req, res) => {
  const id = req.session['userID'];
  const templateVars = { userID: usersDb[id] };
  res.render('urls_register', templateVars);
});

// submit registration form
app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  const result = createUser({ id: randomID, email: req.body['email'], password: req.body['password'] }, usersDb);
  if (result.error) {
    res.status(400).send(result.error);
  }
  req.session['userID'] = randomID;
  res.redirect('/urls');
});

// login page
app.get('/login', (req, res) => {
  const id = req.session['userID'];
  const templateVars = { userID: usersDb[id] };
  res.render('urls_login', templateVars);
});

// sumbit login info
app.post('/login', (req,res) => {
  if (!checkEmail(req.body['email'], usersDb)) {
    res.status(403).send('no email in the system');
  } else if (!checkPass(req.body['password'], usersDb)) {
    res.status(403).send('wrong password, please try again');
  } else {
    let fetchID = checkPass(req.body['password'], usersDb);
    req.session['userID'] = fetchID;
    res.redirect('/urls');
  }
});


// ****************************************************** SERVER LISTEN ON PORT 8080 ********************************************************

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
