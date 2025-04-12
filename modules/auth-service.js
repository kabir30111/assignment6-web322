const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let User = null;
let connection = null;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

module.exports.initialize = async function () {
  if (!connection) {
    connection = await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    User = mongoose.models.users || mongoose.model("users", userSchema);
  }
};

function ensureInitialized() {
  if (!User) {
    throw new Error("MongoDB not connected");
  }
}

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    try {
      ensureInitialized();

      if (userData.password !== userData.password2) {
        return reject("Passwords do not match");
      }

      bcrypt.hash(userData.password, 10)
        .then(hash => {
          const newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: []
          });

          return newUser.save();
        })
        .then(() => resolve())
        .catch(err => {
          if (err.code === 11000) {
            reject("User Name already taken");
          } else {
            reject("There was an error creating the user: " + err);
          }
        });

    } catch (err) {
      reject("There was an error creating the user: " + err);
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    try {
      ensureInitialized();

      User.findOne({ userName: userData.userName })
        .then(user => {
          if (!user) return reject("Unable to find user: " + userData.userName);

          return bcrypt.compare(userData.password, user.password).then(match => {
            if (!match) return reject("Incorrect Password for user: " + userData.userName);

            // Limit to 8 login history entries
            if (user.loginHistory.length >= 8) user.loginHistory.pop();

            user.loginHistory.unshift({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent
            });

            return User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
              .then(() => resolve(user));
          });
        })
        .catch(err => reject("There was an error verifying the user: " + err));
    } catch (err) {
      reject("There was an error verifying the user: " + err);
    }
  });
};
