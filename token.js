const jwt = require("jsonwebtoken");
const createToken = (_id, _username, _email) => {
  return jwt.sign({ id: _id, username: _username, email: _email }, "loveYouAza@l", { expiresIn: "3d" });
};

module.exports = createToken;
