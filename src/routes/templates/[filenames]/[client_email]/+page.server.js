import { getFormTemplate, updateFormUsage } from "$lib/mongo.js";
import { gatherRedtailInfo, print_env } from "$lib/redtail.js";
import { autofillForm, fillFormByMap } from "$lib/pdf.js";

/**
 * @typedef {import("$lib/types.d.ts").Template} Template
 * @typedef {import("$lib/redtail.js").RedtailInfo} RedtailInfo
 */

/**
 * @typedef {Object} Props
 * @property {Template[]} templates
 * @property {RedtailInfo | null} client_redtail
 * @property {string[]} filled_pdf_base64_list
 */

export async function load({ params, url }) {
  /** @type{string} */
  const filenames_string = params.filenames
  /** @type{string} */
  const client_email = params.client_email
  /** @type{string[]} */
  let filenames = []
  if (filenames_string.includes("+")) {
    filenames = filenames_string.split("+")
  } else {
    filenames = [filenames_string]
  }
  let string_rep_list = []
  /** @type {Props} */
  let props = {
    templates: [],
    client_redtail: null,
    filled_pdf_base64_list: [],
  };

  // print_env();
  const redtail_info = await gatherRedtailInfo(client_email);
  props.client_redtail = redtail_info;
  console.log("redtail_info: ", redtail_info)

  for (const filename of filenames) {
    await updateFormUsage(filename)
    //console.log("filename: ", filename)
    const mongoose_result = await getFormTemplate(filename)
    if (!mongoose_result) {
      throw new Error("Form template not found")
    }
    props.templates.push(mongoose_result)
    const autofill_map = new Map(Object.entries(mongoose_result.field_json));
    //console.log("autofill_map: ", autofill_map)

    const autofilled_map = autofillForm(redtail_info, autofill_map);
    console.log("autofilled_map: ", autofilled_map)

    const filled_pdf_base64 = await fillFormByMap(mongoose_result.pdf_base64, autofilled_map);
    //console.log("filled_pdf_base64: ", filled_pdf_base64)
    string_rep_list.push(filled_pdf_base64)
  }
  props.filled_pdf_base64_list = string_rep_list
  return { props: props };
}
