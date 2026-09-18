import mongoose from "mongoose";
const { Schema } = mongoose;
export const Account = mongoose.model(
  "Account",
  new Schema(
    {
      name: String,
      email: { type: String, unique: true, index: true },
      password: String,
      admin: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
export const Session = mongoose.model(
  "Session",
  new Schema({
    digest: { type: String, unique: true },
    account: Schema.Types.ObjectId,
    expires: { type: Date, expires: 0 },
  }),
);
export const Form = mongoose.model(
  "Form",
  new Schema(
    {
      owner: { type: Schema.Types.ObjectId, index: true },
      title: String,
      description: String,
      accent: String,
      confirmation: String,
      fields: [Schema.Types.Mixed],
      state: { type: String, default: "draft" },
      revision: { type: Number, default: 1 },
      members: [
        {
          email: String,
          role: String,
          accepted: { type: Boolean, default: false },
        },
      ],
    },
    { timestamps: true },
  ),
);
export const Response = mongoose.model(
  "Response",
  new Schema(
    {
      form: { type: Schema.Types.ObjectId, index: true },
      revision: Number,
      fields: [Schema.Types.Mixed],
      payload: Schema.Types.Mixed,
      submissionKey: String,
    },
    { timestamps: true },
  ),
);
Response.schema.index({ form: 1, submissionKey: 1 }, { unique: true });
export const Template = mongoose.model(
  "Template",
  new Schema(
    {
      owner: Schema.Types.ObjectId,
      title: String,
      description: String,
      fields: [Schema.Types.Mixed],
      shared: Boolean,
    },
    { timestamps: true },
  ),
);
