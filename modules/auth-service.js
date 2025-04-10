module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    console.log("🔄 Trying to connect to MongoDB...");

    mongoose
      .connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("✅ Connected to MongoDB");
        User = mongoose.model("users", userSchema);
        resolve();
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        reject("Failed to connect to MongoDB");
      });
  });
};
