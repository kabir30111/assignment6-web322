const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let User;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let connectionPromise;

module.exports.initialize = async function () {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  await connectionPromise;

  if (!mongoose.models.User) {
    User = mongoose.model("User", userSchema);
  } else {
    User = mongoose.models.User;
  }
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (!User) {
      return reject("User model not initialized");
    }

    if (userData.password !== userData.password2) {
      return reject("Passwords do not match");
    }

    bcrypt
      .hash(userData.password, 10)
      .then((hash) => {
        const newUser = new User({
          userName: userData.userName,
          password: hash,
          email: userData.email,
          loginHistory: [],
        });

        return newUser.save();
      })
      .then(() => resolve())
      .catch((err) => {
        if (err.code === 11000) {
          reject("User Name already taken");
        } else {
          reject("There was an error creating the user: " + err);
        }
      });
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (!User) return reject("User model not initialized");

    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) return reject("Unable to find user: " + userData.userName);

        return bcrypt.compare(userData.password, user.password).then((result) => {
          if (!result) {
            return reject("Incorrect Password for user: " + userData.userName);
          }

          if (user.loginHistory.length === 8) {
            user.loginHistory.pop();
          }

          user.loginHistory.unshift({
            dateTime: new Date().toString(),
            userAgent: userData.userAgent,
          });

          return User.updateOne(
            { userName: user.userName },
            { $set: { loginHistory: user.loginHistory } }
          ).then(() => resolve(user));
        });
      })
      .catch((err) => reject("There was an error verifying the user: " + err));
  });
};
