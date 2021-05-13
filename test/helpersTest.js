const { assert } = require('chai');
const { checkEmail } = require('../helpers.js');

const testUsers = {
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

describe('checkEmail', function() {
  it('should return an object of specified email', function() {
    const id = checkEmail("user@example.com", testUsers);
    const expectedOutput = testUsers['userRandomID'];
    
    assert.deepEqual(id, expectedOutput, 'oops! not what we have expected!');
    
  });
  it('should return null if no user exists', function() {
    const id = checkEmail("nouser@example.com", testUsers);
    
    assert.deepEqual(id, null, 'oops! not what we have expected!');
    
  });
});