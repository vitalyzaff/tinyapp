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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

// new route handler for /urls
app.get('/urls', (req, res) => {
  const id = req.cookies['userID'];
  const templateVars = { userID: usersDb[id], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// route definition for form submission
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  const longURL = req.body['longURL'];
  const userID = req.cookies['userID'];
  urlDatabase[randomString] = { longURL, userID };
  console.log(urlDatabase);
  res.redirect(`/urls/${randomString}`);
});

// redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});



// GET route to show the form
app.get('/urls/new', (req, res) => {
  const id = req.cookies['userID'];
  if (!id) {
    res.redirect('/login');
  }
  const templateVars = { userID: usersDb[id]};
  res.render('urls_new', templateVars);
});

// second route and handler to pass in long url and return its shortened form
app.get('/urls/:shortURL', (req, res) => {
  res.redirect("/urls");
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
  const longURL = req.body['longURL'];
  urlDatabase[shortURL] = { longURL };
  res.redirect('/urls');
});

// link to edit particular link
app.post('/urls/:shortURL/', (req, res) => {
  const id = req.cookies['userID'];
  const templateVars = { userID: usersDb[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// user logout
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

// registration page
app.get('/register', (req, res) => {
  const id = req.cookies['userID'];
  const templateVars = { userID: usersDb[id] };
  res.render('urls_register', templateVars);
});

// submit registration form
app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  const result = createUser({ userID: randomID, email: req.body['email'], password: req.body['password'] }, randomID);
  if (result.error) {
    res.status(400);
    res.send(result.error);
  }
  res.cookie('userID', randomID);
  res.redirect('/urls');
});

// login page
app.get('/login', (req, res) => {
  const id = req.cookies['userID'];
  const templateVars = { userID: usersDb[id] };
  res.render('urls_login', templateVars);
});

// sumbit login info
app.post('/login', (req,res) => {
  const result = checkUser({ email: req.body['email'], password: req.body['password'] });
  if (result.error) {
    res.status(403);
    res.send(result.error);
  } else {
    res.cookie('userID', result);
    res.redirect('/urls');
  }
});


// *****************************************************************************************************************************************

// set server listening on specified port

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// ***************************************************** HELPER FUNCTIONS *******************************************************************

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


// 
const checkEmail = (email) => {
  const objArr = Object.values(usersDb);
  for (const user of objArr) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const checkPass = (password) => {
  const objArr = Object.values(usersDb);
  for (const user of objArr) {
    if (user.password === password) {
      return user.id;
    }
  }
  return null;
};

const createUser = (userParams, id) => {
  if (checkEmail(userParams.email)) {
    return { data: null, error: "user already exists" };
  }
  const { userID, email, password } = userParams;
  if (!email || !userID || !password) {
    return { data: null, error: "invalid fields" };
  }
  usersDb[id] = userParams;
  return { data: userParams, error: null };
};

const checkUser = (userParams) => {
  if (!checkEmail(userParams.email)) {
    return { data: null, error: 'no user in database' };
  }
  if (!checkPass(userParams.password)) {
    return { data: null, error: 'wrong password' };
  }
  if (checkEmail(userParams.email) && checkPass(userParams.password)) {
    return checkPass(userParams.password);
  }
};
