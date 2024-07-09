import mongoose from "mongoose"
import { FormTemplate } from "./models/FormTemplate.js"
import { FormBundle } from "./models/FormBundle.js"
import { PDFDocument, PDFTextField } from "pdf-lib"

/** @typedef{import('$lib/types').Template} Template*/
/** @typedef{import('$lib/types').FormBundle} FormBundle*/

/** Connect to MongoDB, with error handling and a connection message.
 * @async
 * @function connectToMongo
 * @returns {Promise<void>}
 */
export const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI?? "")
    // console.log("Connected to MongoDB")
  } catch (error) {
    console.log("Error connecting to MongoDB", error)
    throw error
  }
}

/** Disconnect from MongoDB, with error handling and a disconnection message.
 * @async
 * @returns {Promise<void>}
 */
export const disconnectFromMongo = async () => {
  try {
    await mongoose.disconnect()
    // console.log("Disconnected from MongoDB")
  } catch (error) {
    console.log("Error disconnecting from MongoDB", error)
    throw error
  }
}

/** Upload a form template to MongoDB. Returns true if the operation was sucessful, false otherwise.
 * @async
 * @param {string} filename - The filename of the form template.
 * @param {string} pdf_base64 - The PDF binary of the form template.
 * @returns {Promise<boolean>}
 */
export const uploadFormTemplate = async (filename, pdf_base64) => {
  try {
    await connectToMongo()
    // Parse the PDF for text fields
    const pdf_binary = Buffer.from(pdf_base64, "base64")
    const pdf_bytes = new Uint8Array(pdf_binary)
    const pdf_doc = await PDFDocument.load(pdf_bytes)
    const form = pdf_doc.getForm()
    const fields = form.getFields()
    const filterFields = fields
      .filter((field) => field instanceof PDFTextField)
      .map((field) => /** @type {PDFTextField} */ (field).getName())
    
    const field_json = filterFields.reduce((acc, fieldName) => {
      // @ts-ignore
      acc[fieldName] = ""
      return acc
    }, {})

    const formTemplate = new FormTemplate({
      filename: filename,
      pdf_base64: pdf_base64,
      field_json: field_json,
      description: "",
      form_category: "",
      last_used: new Date(),
      times_used: 0,
    })
    await formTemplate.save()
    console.log("Saved form template to MongoDB")
    return true
  } catch (error) {
    console.log("Error saving form template to MongoDB", error)
    return false
  } finally {
    await disconnectFromMongo()
  }
}

/** Get one form template by filename
 * @async
 * @param {string} filename - The filename of the form template.
 * @returns {Promise<Template>}
 */
export const getFormTemplate = async (filename) => {
  try {
    await connectToMongo()
    const formTemplate = await FormTemplate.findOne({ filename: filename }).lean()
    if (!formTemplate) {
      throw Error("Form template not found in MongoDB")
    }
    const template = {
      // @ts-ignore
      filename: formTemplate.filename,
      // @ts-ignore
      pdf_base64: formTemplate.pdf_base64,
      // @ts-ignore
      field_json: formTemplate.field_json,
      // @ts-ignore
      description: formTemplate.description ?? "",
      // @ts-ignore
      form_category: formTemplate.form_category ?? "",
      // @ts-ignore
      last_used: formTemplate.last_used,
      // @ts-ignore
      times_used: formTemplate.times_used ?? 0,
      // @ts-ignore
      id : formTemplate._id.toString()
    }
    return template
  } catch (error) {
    console.log("Error getting form template from MongoDB", error)
    throw error
  } finally {
    await disconnectFromMongo()
  }
}

/** Get all form templates
 * @async
 * @returns {Promise<Template[]>}
 */
export const getAllTemplates = async () => {
  try {
    await connectToMongo()
    const formTemplates = await FormTemplate.find().lean()
    /** @type{Template[]} */
    const templates = formTemplates.map((formTemplate) => {
      return {
        filename: formTemplate.filename,
        pdf_base64: formTemplate.pdf_base64,
        field_json: formTemplate.field_json,
        description: formTemplate.description??"",
        form_category: formTemplate.form_category??"",
        last_used: formTemplate.last_used,
        times_used: formTemplate.times_used ?? 0,
        // @ts-ignore
        id : formTemplate._id.toString()
      }
    })
    // console.log("Retrieved all form templates from MongoDB")
    return templates
  } catch (error) {
    console.log("Error getting all form templates from MongoDB", error)
    return []
  } finally {
    await disconnectFromMongo()
  }
}

/** Delete a form template by filename
 * @async
 * @param {string} filename - The filename of the form template.
 * @returns {Promise<Boolean>}
 */
export const deleteFormTemplate = async (filename) => {
  try {
    await connectToMongo()
    await FormTemplate.deleteOne({ filename: filename })
    console.log("Deleted form template from MongoDB")
    return true
  } catch (error) {
    console.log("Error deleting form template from MongoDB", error)
    return false
  } finally {
    await disconnectFromMongo()
  }
}

/** Update a form's autofill using a map. Returns false if any operation fails.
 * @async
 * @param {string} filename - The filename of the form template.
 * @param {Map<string, string>} autofillMap - The map of field names to autofill values.
 * @returns {Promise<Boolean>}
 */
export const updateTemplateAutofill = async (filename, autofillMap) => {
  try {
    await connectToMongo()

    const updateResult = await FormTemplate.findOneAndUpdate(
      { filename },
      { $set: { field_json: Object.fromEntries(autofillMap) } },
      { new: true, runValidators: true }
    )

    if (!updateResult) {
      console.log("Form template not found in MongoDB")
      return false
    }

    console.log("Updated form template autofill fields in MongoDB")
    return true
  } catch (error) {
    console.error("Error updating form template autofill fields in MongoDB", error)
    return false
  } finally {
    await disconnectFromMongo()
  }
}

/** Update a form's filename, description, and category. Returns false if any operation fails 
 * @async
 * @param {string} filename - The filename of the form template.
 * @param {string} newFilename - The new filename of the form template.
 * @param {string} description - The new description.
 * @param {string} form_category - The new category.
 * @returns {Promise<Boolean>}
 * */
export const updateForm = async (filename, newFilename, description, form_category) => {
  let f = newFilename
  try {
    await connectToMongo()
    // Does a form already exist with that filename?
    const existingForm = await FormTemplate.findOne({ filename: newFilename })
    if (existingForm) {
      console.log(`Form template with filename ${newFilename} already exists in MongoDB`)
      const newFilenameNoExt = newFilename.split(".")[0]
      f = newFilenameNoExt + "_1.pdf"
    }
    // @ts-ignore
    const updateResult = await FormTemplate.findOneAndUpdate(
      { filename },
      { $set: { filename: f, description: description, form_category: form_category } },
      { new: true, runValidators: true }
    )
    return true
  }
  catch (error) {
    console.error("Error updating form template in MongoDB", error)
    return false
  }
  finally {
    await disconnectFromMongo()
  }
}

/** Update a form's last used date and increments use count. Returns false if any operation fails
 * @async
 * @param {string} filename - The filename of the form template.
 * @returns {Promise<Boolean>}
 */
export const updateFormUsage = async (filename) => {
  try {
    await connectToMongo()
    // @ts-ignore
    const updateResult = await FormTemplate.findOneAndUpdate(
      { filename },
      { $set: { last_used: new Date() }, $inc: { times_used: 1 } },
      { new: true, runValidators: true }
    )
    return true
  }
  catch (error) {
    console.error("Error updating form template usage in MongoDB", error)
    return false
  }
  finally {
    await disconnectFromMongo()
  }
}

/** Upload a form bundle to MongoDB. Returns true if the operation was sucessful, false otherwise.
 * @async
 * @param {string} bundle_name - The name of the form bundle.
 * @param {string[]} forms - The filenames of the form templates, in order.
 * @returns {Promise<Boolean>}
 */
export const createFormBundle = async (bundle_name, forms) => {
  try {
    await connectToMongo()
    let formIds = []
    for (let filename of forms) {
      const formTemplate = await FormTemplate.findOne({filename})
      if (!formTemplate) {
        console.log(`Form template with filename ${filename} not found in MongoDB`)
        return false
      }
      formIds.push(formTemplate._id)
    }
    const formBundle = new FormBundle({
      bundle_name,
      forms: formIds,
    })
    await formBundle.save()
    console.log("Saved form bundle to MongoDB")
    return true
  } catch (error) {
    console.log("Error saving form bundle to MongoDB", error)
    return false
  } finally {
    await disconnectFromMongo()
  }
}

/** Get all form bundles from MongoDB.
 * @async
 * @returns {Promise<FormBundle[]>}
 */
export const getAllFormBundles = async () => {
  try {
    await connectToMongo();
    const formBundles = await FormBundle.find().populate("forms").exec();
    //console.log("Retrieved all form bundles from MongoDB");

    // Convert Mongoose documents to plain JavaScript objects
    return formBundles.map(bundle => ({
      bundle_name: bundle.bundle_name,
      id: bundle._id.toString(),
      // @ts-ignore
      forms: bundle.forms.map((form) => ({
        filename: form.filename,
        pdf_base64: form.pdf_base64,
        field_json: form.field_json,
        description: form.description,
        form_category: form.form_category,
        last_used: form.last_used,
        times_used: form.times_used,
        id: form._id.toString()
      }))
    }));
  } catch (error) {
    console.log("Error retrieving all form bundles from MongoDB", error);
    return [];
  } finally {
    await disconnectFromMongo();
  }
};

/** Delete a form bundle by bundle name
 * @param {string} bundle_name - The name of the form bundle.
 * @returns {Promise<Boolean>}
 */
export const deleteFormBundle = async (bundle_name) => {
  try {
    await connectToMongo()
    await FormBundle.deleteOne({ bundle_name: bundle_name })
    console.log("Deleted form bundle from MongoDB")
    return true
  } catch (error) {
    console.log("Error deleting form bundle from MongoDB", error)
    return false
  } finally {
    await disconnectFromMongo()
  }
}

/** Update a form bundle's name and forms. Returns true if the operation was sucessful, false otherwise.
 * @async
 * @param {string} bundleId - The ID of the form bundle.
 * @param {string} bundle_name - The name of the form bundle.
 * @param {string[]} forms - The filenames of the form templates, in order.
 * @returns {Promise<Boolean>}
 */
export const updateFormBundle = async (bundleId, bundle_name, forms) => {
  let name = bundle_name;
  try {
    await connectToMongo();
    // Check if a bundle with that name already exists
    const existingBundle = await FormBundle.findOne({ bundle_name });
    if (existingBundle) {
      console.log(`Form bundle with name ${bundle_name} already exists in MongoDB`);
      name = bundle_name + "_1";
    }
    let formIds = [];
    for (let filename of forms) {
      const formTemplate = await FormTemplate.findOne({ filename });
      if (!formTemplate) {
        console.log(`Form template with filename ${filename} not found in MongoDB`);
        return false;
      }
      formIds.push(formTemplate._id);
    }
    const result = await FormBundle.findByIdAndUpdate(bundleId, {
      bundle_name: name,
      forms: formIds
    }, { new: true });  // { new: true } ensures that the updated document is returned
    if (result) {
      console.log("Updated form bundle in MongoDB");
      return true;
    } else {
      console.log("No changes made to the form bundle");
      return false;
    }
  } catch (error) {
    console.log("Error updating form bundle in MongoDB", error);
    return false;
  } finally {
    await disconnectFromMongo();
  }
};
