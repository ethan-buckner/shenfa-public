import { PDFDocument, PDFTextField } from 'pdf-lib';

/** @typedef{(import("$lib/redtail.js").RedtailInfo)} RedtailInfo*/

/** Fill a PDF form with the given map of field names to values.
 * @param {string} pdf_base64 - The base64-encoded PDF file to fill.
 * @param {Map<string, string>} map - The map of field names to values.
 * @returns {Promise<string>} - The base64-encoded filled PDF.
 */
export const fillFormByMap = async (pdf_base64, map) => {
  try {
    console.log("Starting PDF processing...");

    // Decode Base64
    const binary_string = atob(pdf_base64);
    const len = binary_string.length;
    const pdf_bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pdf_bytes[i] = binary_string.charCodeAt(i);
    }

    console.log("Base64 decoded successfully, length:", pdf_bytes.length);

    // Load PDF Document
    const pdfDoc = await PDFDocument.load(pdf_bytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log("PDF loaded successfully, number of fields:", fields.length);

    // Process each field in the map
    for (const [name, value] of map) {
      try {
        const field = fields.find(f => f.getName() === name);
        if (field) {
          if (field instanceof PDFTextField) {
            field.setText(value);
            // console.log(`Field ${name} set to ${value}`);
          } else {
            console.warn(`Field ${name} is not a text field.`);
          }
        } else {
          console.warn(`Field ${name} not found.`);
        }
      } catch (error) {
        console.error(`Error processing field ${name}: ${error}`);
      }
    }

    // Save the filled PDF
    const filled_pdf_bytes = await pdfDoc.save();
    console.log("PDF filled and saved successfully.");

    // Convert to Base64
    const filled_pdf_base64 = Buffer.from(filled_pdf_bytes).toString('base64');
    return filled_pdf_base64;
  } catch (error) {
    console.error(`Error filling the form: ${error}`);
    throw error;
  }
};


/** Fill a PDF form with the given Redtail info and autofill map.
 * @param {RedtailInfo} redtail_info - The Redtail info to use for autofilling.
 * @param {Map<string, string>} autofill_map - The map of field names to Redtail info keys.
 */
export const autofillForm = (redtail_info, autofill_map) => {
  const autofillResult = new Map()
  for (const [key, value] of autofill_map) {
    if (redtail_info.hasOwnProperty(value)) {
      /* @ts-ignore */
      autofillResult.set(key, redtail_info[value]);
    } else {
      autofillResult.set(key, ""); // or any default value you prefer
    }
  }
  return autofillResult;
}