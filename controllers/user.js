const bcrypt = require("bcrypt");
const validate = require("validator");

const User = require("../models/User");
const createToken = require("../token");
exports.signUp = async (req, res, next) => {
  let username = req.body.username;
  let fullname = req.body.fullname;
  let email = req.body.email;
  let password = req.body.password;

  if (!(username && fullname && email && password)) {
    console.error("Value Error: All fields are madatory");
    return res.status(400).json({ error: "Value Error: All fields are mandatory" });
  }
  //Vaildate username and password
  if (!validate.isEmail(email)) {
    console.error("Value Error: Invalid Eamil");
    return res.status(400).json({ error: "Value Error: Invalid Eamil" });
  }
  if (!validate.isStrongPassword(password)) {
    console.log(validate.isStrongPassword(password));
    console.error("Value Error: Invalid Password");
    return res.status(400).json({ error: "Value Error:Password is not strong enough!!!" });
  }

  //Encrypt password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const new_user = new User(fullname, username, email, hash);
  new_user
    .create_user()
    .then((response) => {
      id = response[0].insertId;
      const token = createToken(id, new_user.username, new_user.email);
      res.status(200).json({ username: username, token: token });
    })
    .catch((err) => {
      console.log(err);
      res.status(300).json({ error: err.message });
    });
};

exports.logIn = async (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!(email && password)) {
    console.error("Value Error: All fields are madatory");
    return res.status(400).json({ error: "Value Error: All fields are mandatory" });
  }
  //Vaildate username and password
  if (!validate.isEmail(email)) {
    return res.status(400).json({ error: "Value Error: Invalid Eamil" });
  }
  //Encrypt password
  User.findOne(email)
    .then(async (respose) => {
      if (!respose[0].length) {
        res.status(300).json({ error: "No account for the Email found" });
      } else {
        let pass = respose[0][0].password;
        const match = await bcrypt.compare(password, pass);
        if (match) {
          const token = createToken(respose[0][0].id, respose[0][0].username, email);
          res.status(200).json({ username: respose[0][0].username, token: token });
        } else {
          res.status(300).json({ error: `Incorrect password for Username: ${respose[0][0].username}` });
        }
      }
    })
    .then(() => {
      User.logged_in(email);
    })
    .catch((err) => res.status(400).json({ error: err }));
};
