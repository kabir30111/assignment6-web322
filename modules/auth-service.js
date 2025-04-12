const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let User;

// Global-safe DB connection (supports Vercel)
let connection;

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

function getUserModel() {
  if (!connection) throw new Error("MongoDB not connected");
  return connection.models?.users || connection.model("users", userSchema);
}

module.exports.initialize = async function () {
  if (!global._mongooseConnection) {
    global._mongooseConnection = mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  connection = await global._mongooseConnection;
  User = getUserModel();
};

module.exports.registerUser = function (userData) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!User) {
        User = getUserModel();
      }

      if (userData.password !== userData.password2) {
        return reject("Passwords do not match");
      }

      const hash = await bcrypt.hash(userData.password, 10);

      const newUser = new User({
        userName: userData.userName,
        password: hash,
        email: userData.email,
        loginHistory: [],
      });

      await newUser.save();
      resolve();
    } catch (err) {
      if (err.code === 11000) {
        reject("User Name already taken");
      } else {
        reject("There was an error creating the user: " + err);
      }
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!User) {
        User = getUserModel();
      }

      const user = await User.findOne({ userName: userData.userName });
      if (!user) return reject("Unable to find user: " + userData.userName);

      const isMatch = await bcrypt.compare(userData.password, user.password);
      if (!isMatch) return reject("Incorrect Password for user: " + userData.userName);

      if (user.loginHistory.length === 8) {
        user.loginHistory.pop();
      }

      user.loginHistory.unshift({
        dateTime: new Date().toString(),
        userAgent: userData.userAgent,
      });

      await User.updateOne(
        { userName: user.userName },
        { $set: { loginHistory: user.loginHistory } }
      );

      resolve(user);
    } catch (err) {
      reject("There was an error verifying the user: " + err);
    }
  });
};
