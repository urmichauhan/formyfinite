import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { createApp } from "../server/app.js";
const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());
const app = createApp({
  encryptionKey: randomBytes(32).toString("hex"),
  production: false,
});
const server = app.listen(3000, () =>
  console.log(
    "DEMO ONLY: http://localhost:3000 — register an account. Data is deleted when this process stops.",
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      await mongo.stop();
      process.exit(0);
    }),
  );
