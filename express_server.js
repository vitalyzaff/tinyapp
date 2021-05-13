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
console.log(urlDatabase[0]);

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
  if (!id) {
    res.redirect('/login');
  }
  const usrURLs = urlsForUser(id);
  const templateVars = { userID: usersDb[id], urls: usrURLs };
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
  const id = req.cookies['userID'];
  const templateVars = { userID: usersDb[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
  // res.redirect("/urls");
});

// delete an object key
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.cookies['userID'];
  const { shortURL } = req.params;
  if (id === urlDatabase[shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(400);
    res.send('not autorized');
  }
});

// update the link and redirect to main page
app.post('/urls/:shortURL/edit', (req, res) => {
  const id = req.cookies['userID'];
  console.log(id);
  const { shortURL } = req.params;
  console.log(shortURL);
  if (id !== urlDatabase[shortURL]['userID']) {
    res.status(400);
    res.send('not authorized');
  }
  const longURL = req.body['longURL'];
  urlDatabase[shortURL] =  { longURL, userID: id };
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
  const result = createUser({ id: randomID, email: req.body['email'], password: req.body['password'] }, randomID);
  if (result.error) {
    res.status(400);
    res.send(result.error);
  }
  console.log(usersDb);
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
  if (!checkEmail(req.body['email'])) {
    res.status(403);
    res.send('no email in the system');
  } else if (!checkPass(req.body['password'])) {
    res.status(403);
    res.send('wrong password, please try again');
  } else {
    let fetchID = checkPass(req.body['password']);
    res.cookie('userID', fetchID);
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


const createUser = (userParams, userID) => {
  if (checkEmail(userParams.email)) {
    return { data: null, error: "user already exists" };
  }
  const { id, email, password } = userParams;
  if (!email || !id || !password) {
    return { data: null, error: "invalid fields" };
  }
  usersDb[id] = userParams;
  return { data: userParams, error: null };
};


const urlsForUser = (id) => {
  const usrURLs = {};
  const objArr = Object.values(urlDatabase);
  for (let i of objArr) {
    if (i.userID === id) {
      let shortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === i);
      usrURLs[shortURL] = urlDatabase[shortURL]['longURL'];
    }
  }
  return usrURLs;
};


// const urlDatabase = {
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   b6UdxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48l" }
// };

// // const longURL = {longURL: "https://www.tn.ca"};
// // const shortURL = 'b6UTxQ'
// // urlDatabase[shortURL] = longURL;
// const longURL = 'apple.ca';
// const obj = {};
// obj.url = {longURL};
// console.log(obj);

// const objArr = Object.values(urlDatabase);
// for (let i of objArr){
//   if(i.userID === 'aJ48lW'){
//     const shortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === i)
//     console.log(urlDatabase[shortURL]['longURL'])
//   }
//