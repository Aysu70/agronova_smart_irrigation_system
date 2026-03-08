const { MongoMemoryServer } = require("mongodb-memory-server");

(async () => {
  try {
    console.log("🌱 Starting in-memory MongoDB...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    console.log("✅ In-memory MongoDB running at", uri);

    // Require and run the existing seed script which reads process.env.MONGODB_URI
    require("./src/scripts/seedData.js");

    // Note: seedData.js calls process.exit at completion; the in-memory server
    // will stop when the Node process exits. If you want to keep it running,
    // you can remove the process.exit calls in the seed script.
  } catch (err) {
    console.error("Failed to start in-memory MongoDB:", err);
    process.exit(1);
  }
})();
