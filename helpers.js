const bcrypt = require('bcrypt');
const saltRounds = 10;


// generate random string
const generateRandomString = function() {
  const random = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(random[Math.floor(Math.random() * random.length)]);
  }
  arr = arr.join('');
  return arr;
};

// check if users email exists in db
const checkEmail = (email, database) => {
  const objArr = Object.values(database);
  for (const user of objArr) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// check if password matches for a specified user
const checkPass = (password, database) => {
  const objArr = Object.values(database);
  for (const user of objArr) {
    if (bcrypt.compareSync(password, user.password)) {
      return user.id;
    }
  }
  return null;
};

// create new user object
const createUser = (userParams, database) => {
  if (checkEmail(userParams.email, database)) {
    return { data: null, error: "user already exists" };
  }
  const { id, email, password } = userParams;
  if (!email || !id || !password) {
    return { data: null, error: "invalid fields" };
  }
  userParams.password = bcrypt.hashSync(userParams.password, saltRounds);
  database[id] = userParams;
  return { data: userParams, error: null };
};

// return urls of the user who created them
const urlsForUser = (id, database) => {
  const usrURLs = {};
  const objArr = Object.values(database);
  for (let i of objArr) {
    if (i.userID === id) {
      let shortURL = Object.keys(database).find(key => database[key] === i);
      usrURLs[shortURL] = database[shortURL]['longURL'];
    }
  }
  return usrURLs;
};

module.exports = { checkPass, checkEmail, generateRandomString, createUser, urlsForUser };