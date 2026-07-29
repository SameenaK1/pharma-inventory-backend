const jwt = require("jsonwebtoken");
const createToken = (_id, _username, _email) => {
  return jwt.sign({ id: _id, username: _username, email: _email }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

module.exports = createToken;
