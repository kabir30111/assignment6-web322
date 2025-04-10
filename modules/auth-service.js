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

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    // ✅ Connect globally (not createConnection)
    mongoose
      .connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        User = mongoose.model("users", userSchema);
        resolve();
      })
      .catch((err) => {
        reject("Failed to connect to MongoDB: " + err);
      });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (!User) {
      reject("User model is not initialized yet. Try again in a moment.");
      return;
    }

    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return;
    }

    bcrypt
      .hash(userData.password, 10)
      .then((hash) => {
        userData.password = hash;

        let newUser = new User({
          userName: userData.userName,
          password: userData.password,
          email: userData.email,
          loginHistory: [],
        });

        newUser
          .save()
          .then(() => resolve())
          .catch((err) => {
            if (err.code === 11000) {
              reject("User Name already taken");
            } else {
              reject("There was an error creating the user: " + err);
            }
          });
      })
      .catch((err) => {
        console.error("🔥 Error hashing password:", err);
        reject("There was an error encrypting the password");
      });
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (!User) {
      reject("User model is not initialized yet. Try again in a moment.");
      return;
    }

    User.find({ userName: userData.userName })
      .then((users) => {
        if (users.length === 0) {
          reject("Unable to find user: " + userData.userName);
          return;
        }

        bcrypt
          .compare(userData.password, users[0].password)
          .then((result) => {
            if (!result) {
              reject(
                "Incorrect Password for user: " + userData.userName
              );
              return;
            }

            if (users[0].loginHistory.length === 8) {
              users[0].loginHistory.pop();
            }

            users[0].loginHistory.unshift({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent,
            });

            User.updateOne(
              { userName: users[0].userName },
              { $set: { loginHistory: users[0].loginHistory } }
            )
              .then(() => {
                resolve(users[0]);
              })
              .catch((err) => {
                reject("There was an error verifying the user: " + err);
              });
          })
          .catch(() => {
            reject(
              "Incorrect Password for user: " + userData.userName
            );
          });
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
