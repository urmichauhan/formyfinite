import mongoose from "mongoose";
const { Schema } = mongoose;
const user = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    password: String,
    role: { type: String, default: "user" },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const session = new Schema({
  token: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  expiresAt: { type: Date, expires: 0 },
});
const form = new Schema(
  {
    title: String,
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: "User", index: true },
    fields: [Schema.Types.Mixed],
    status: { type: String, default: "draft" },
    version: { type: Number, default: 1 },
    theme: { type: String, default: "#6754d8" },
    thankYou: {
      type: String,
      default: "Thank you! Your response has been received.",
    },
    collaborators: [
      {
        email: String,
        role: String,
        accepted: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);
const submission = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, index: true },
    answers: Schema.Types.Mixed,
    fields: [Schema.Types.Mixed],
    formVersion: Number,
  },
  { timestamps: true },
);
const template = new Schema(
  {
    title: String,
    description: String,
    fields: [Schema.Types.Mixed],
    owner: Schema.Types.ObjectId,
    shared: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const User = mongoose.model("User", user),
  Session = mongoose.model("Session", session),
  Form = mongoose.model("Form", form),
  Submission = mongoose.model("Submission", submission),
  Template = mongoose.model("Template", template);
