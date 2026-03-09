#!/usr/bin/env node
require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");

(async () => {
  try {
    console.log("🌱 Starting persistent in-memory MongoDB...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    console.log("✅ In-memory MongoDB running at", uri);

    // Prevent seed script from calling process.exit so we can keep server running
    process.exit = (code) => {
      console.log(
        `Intercepted process.exit(${code}) from seed script — keeping process alive.`,
      );
    };

    // Run the seed script (it will call process.exit normally, but we've intercepted it)
    console.log("🌱 Seeding demo data...");
    require(path.join(__dirname, "src", "scripts", "seedData.js"));

    // Give seed script time to finish (seed script logs completion then 'exits')
    // Wait a short time then start the API server using the same MONGODB_URI
    setTimeout(() => {
      console.log(
        "🚀 Starting backend server connected to in-memory MongoDB...",
      );
      require(path.join(__dirname, "src", "server.js"));
    }, 1500);

    // Graceful shutdown: stop mongod when process exits
    const stop = async () => {
      console.log("Shutting down in-memory MongoDB...");
      try {
        await mongod.stop();
      } catch (e) {
        console.error("Error stopping in-memory MongoDB:", e);
      }
      process.exit(0);
    };

    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  } catch (err) {
    console.error("Failed to start in-memory MongoDB:", err);
    process.exit(1);
  }
})();
