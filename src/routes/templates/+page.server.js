import { FormTemplate } from "$lib/models/FormTemplate.js";
import {
  connectToMongo,
  disconnectFromMongo,
  uploadFormTemplate,
  deleteFormTemplate,
} from "$lib/mongo.js";

/**
 * Load function for server-side data fetching.
 *
 * @returns {Promise<{props: any}>} - A promise that resolves to an object with props.
 */
export async function load() {
  await connectToMongo();
  try {
    const response = await FormTemplate.find({});
    console.log("Successfully retrieved form templates from MongoDB");

    const templates = response.map((template) => {
      return {
        filename: template.filename,
        pdf_base64: template.pdf_base64,
        field_json: template.field_json,
        description: template.description,
        form_category: template.form_category,
        last_used: template.last_used,
        times_used: template.times_used,
      }
    });

    return {
      props: {
        templates: templates,
      },
    };
  } catch (error) {
    console.log("Error retrieving form templates from MongoDB", error);
    throw error;
  } finally {
    disconnectFromMongo();
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  upload: async ({ cookies, request }) => {
    console.log("Default submit action");
    const data = await request?.formData();
    const fileOrNull = data.get("file");
    if (fileOrNull) {
      // console.log(fileOrNull);
      /** @type {File} */
      // @ts-ignore
      const file = fileOrNull;
      let filename = file.name;
      //Strip leading and trailing whitespace
      filename = filename.trim().replace(/[\s+]/g, "_");

      // Does a template with this filename already exist? If so, change the filename
      try {
        await connectToMongo();
        const template = await FormTemplate.findOne({ filename: filename });
        await disconnectFromMongo();
        if (template) {
          console.log(`Template with filename ${filename} already exists.`);
          const filenameNoExt = filename.split(".")[0];
          filename = `${filenameNoExt}_1.pdf`;
        }
      } catch (error) {
        console.log(`Error checking for existing template with filename ${filename}`, error);
        throw error;
      }
    
      // Get base64 string representation of the file
      const base64 = await file.arrayBuffer().then((buffer) => {
        const bytes = new Uint8Array(buffer);
        return Buffer.from(bytes).toString("base64");
      });

      // console.log(base64);
      await uploadFormTemplate(filename, base64);
      return {
        sucess: true,
      };
    }
    return {
      success: false,
    };
  },
  delete: async ({ cookies, request }) => {
    console.log("Delete action called");
    const data = await request?.formData();
    const filename = data.get("template");
    if (filename) {
      console.log(`Want to delete: ${filename}`);
      // @ts-ignore
      await deleteFormTemplate(filename);
    }
  },
};