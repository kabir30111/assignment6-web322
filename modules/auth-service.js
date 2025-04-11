const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let User;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String
    }
  ]
});

async function initMongo() {
  if (!global._mongoInitialized) {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    User = mongoose.models.users || mongoose.model("users", userSchema);
    global._mongoInitialized = true;
  }
}

module.exports.initialize = async function () {
  await initMongo();
};

module.exports.registerUser = async function (userData) {
  await initMongo();

  if (userData.password !== userData.password2) {
    throw "Passwords do not match";
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = new User({
    userName: userData.userName,
    password: hashedPassword,
    email: userData.email,
    loginHistory: []
  });

  try {
    await newUser.save();
  } catch (err) {
    if (err.code === 11000) {
      throw "User Name already taken";
    }
    throw "Error creating user: " + err.message;
  }
};

module.exports.checkUser = async function (userData) {
  await initMongo();

  const user = await User.findOne({ userName: userData.userName });
  if (!user) throw "Unable to find user: " + userData.userName;

  const isMatch = await bcrypt.compare(userData.password, user.password);
  if (!isMatch) throw "Incorrect Password for user: " + userData.userName;

  if (user.loginHistory.length >= 8) {
    user.loginHistory.pop();
  }

  user.loginHistory.unshift({
    dateTime: new Date().toString(),
    userAgent: userData.userAgent
  });

  await User.updateOne({ _id: user._id }, { $set: { loginHistory: user.loginHistory } });

  return user;
};
