import mongoose, { Schema } from "mongoose";

const FormTemplateSchema = new Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  pdf_base64: {
    type: String,
    required: true,
  },
  field_json: {
    type: Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  form_category: {
    type: String,
    required: false,
  },
  last_used: {
    type: Date,
    required: true,
  },
  times_used: {
    type: Number,
    required: false,
  },
});

export const FormTemplate = mongoose.models.FormTemplate || mongoose.model("FormTemplate", FormTemplateSchema);

/**
 * @property {string} filename
 * @property {string} pdf_base64
 * @property {Object} field_json
 * @property {string} description
 * @property {string} form_category
 * @property {Date} last_used
 * @property {number} times_used
 */
export class FormTemplateData {
  /**
   * @param {string} filename
   * @param {string} pdf_base64
   * @param {Object} field_json
   * @param {string} description
   * @param {string} form_category
   * @param {Date} last_used
   * @param {number} times_used
   * @constructor
   */
  constructor(filename, pdf_base64, field_json, description, form_category, last_used, times_used) {
    this.filename = filename;
    this.pdf_base64 = pdf_base64;
    this.field_json = field_json;
    this.description = description;
    this.form_category = form_category;
    this.last_used = last_used;
    this.times_used = times_used;
  }
}