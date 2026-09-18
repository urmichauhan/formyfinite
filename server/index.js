import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/formyfinite",
);
const app = createApp();
const server = app.listen(process.env.PORT || 3000, () =>
  console.log(
    `FormYfinite ready at ${process.env.APP_ORIGIN || "http://localhost:3000"}`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
