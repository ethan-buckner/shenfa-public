import mongoose, { Schema } from "mongoose";
import { FormTemplate } from "./FormTemplate";

const FormBundleSchema = new Schema({
  bundle_name: {
    type: Schema.Types.String,
    required: true,
    trim: true,
  },
  forms: {
    type: [Schema.Types.ObjectId],
    ref: 'FormTemplate',
    required: true,
    trim: true,
  },
});

export const FormBundle = mongoose.models.FormBundle || mongoose.model("FormBundle", FormBundleSchema);