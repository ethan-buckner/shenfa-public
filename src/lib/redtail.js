import axios from "axios";

const api_key = process.env.REDTAIL_API_KEY ?? "";
const api_url = process.env.REDTAIL_API_URL ?? "";
const redtail_user = process.env.REDTAIL_USERNAME ?? "";
const redtail_password = process.env.REDTAIL_PASSWORD ?? "";

const print_env = () => {
  console.log("api_key:", api_key);
  console.log("api_url:", api_url);
  console.log("redtail_user:", redtail_user);
  console.log("redtail_password:", redtail_password);
};

/**
 * @typedef {Object} RedtailBasicInfo
 * @property {string} email
 * @property {number} redtail_id
 * @property {string} first_name
 * @property {string} middle_name
 * @property {string} last_name
 * @property {string} suffix
 * @property {string} tax_id
 * @property {string} dob_yyyymmdd_dash
 * @property {string} full_name
 * @property {string} nickname
 * @property {string} job_title
 * @property {string} street_address
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {string} country
 * @property {string} work_phone
 * @property {string} mobile_phone
 * @property {string} home_phone
 * @property {string} middle_initial
 * @property {string} dob_yyyy
 * @property {string} dob_mm
 * @property {string} dob_dd
 * @property {string} dob_mmddyyyy_dash
 * @property {string} dob_ddmmyyyy_dash
 * @property {string} dob_mmddyyyy_slash
 * @property {string} dob_yyymmdd_slash
 * @property {string} dob_ddmmyyyy_slash
 */

/**
 * @typedef {Object} RedtailIdentificationInfo
 * @property {string} drivers_license_number
 * @property {string} drivers_license_state
 * @property {string} drivers_license_expiration
 * @property {string} drivers_license_issue_date
 */

/**
 * @typedef {Object} RedtailBankInfo
 * @property {string} bank_name
 * @property {string} account_number
 * @property {string} routing_number
 */

/**
 * @typedef { RedtailBasicInfo & RedtailIdentificationInfo & RedtailBankInfo } RedtailInfo
 */

/**
 * @typedef {(
 * "email" |
 * "redtail_id" |
 * "first_name" |
 * "middle_name" |
 * "last_name" |
 * "suffix" |
 * "tax_id" |
 * "dob_yyyymmdd_dash" |
 * "full_name" |
 * "nickname" |
 * "job_title" |
 * "street_address" |
 * "city" |
 * "state" |
 * "zip" |
 * "country" |
 * "work_phone" |
 * "mobile_phone" |
 * "home_phone" |
 * "middle_initial" |
 * "dob_yyyy" |
 * "dob_mm" |
 * "dob_dd" |
 * "dob_mmddyyyy_dash" |
 * "dob_ddmmyyyy_dash" |
 * "dob_mmddyyyy_slash" |
 * "dob_yyymmdd_slash" |
 * "dob_ddmmyyyy_slash" |
 * "drivers_license_number" |
 * "drivers_license_state" |
 * "drivers_license_expiration" |
 * "drivers_license_issue_date" |
 * "bank_name" |
 * "account_number" |
 * "routing_number"
 * )} RedtailInfoKey
 */

/**
 * Search Redtail for a contact's information by email
 * @param {string} email
 * @returns {Promise<RedtailBasicInfo>}
 */
const searchContactByEmail = async (email) => {
  /** @type RedtailBasicInfo */
  let info = {
    email: email,
    redtail_id: -1,
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    tax_id: "",
    dob_yyyymmdd_dash: "",
    full_name: "",
    nickname: "",
    job_title: "",
    street_address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    work_phone: "",
    mobile_phone: "",
    home_phone: "",
    middle_initial: "",
    dob_yyyy: "",
    dob_mm: "",
    dob_dd: "",
    dob_mmddyyyy_dash: "",
    dob_ddmmyyyy_dash: "",
    dob_mmddyyyy_slash: "",
    dob_yyymmdd_slash: "",
    dob_ddmmyyyy_slash: "",
  };

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: api_url + "/contacts/search?email=" + email,
    headers: {
      include: "phones, emails, addresses",
      Authorization:
        "basic " +
        Buffer.from(
          api_key + ":" + redtail_user + ":" + redtail_password
        ).toString("base64"),
    },
  };

  try {
    const response = await axios.request(config);
    const record = response.data["contacts"][0];

    info.redtail_id = record.id || -1;
    info.first_name = record.first_name || "";
    info.middle_name = record.middle_name || "";
    info.last_name = record.last_name || "";
    info.suffix = record.suffix || "";
    info.tax_id = record.tax_id || "";
    info.dob_yyyymmdd_dash = record.dob || "";
    info.full_name = record.full_name || "";
    info.nickname = record.nickname || "";
    info.job_title = record.job_title || "";
    info.street_address = record.addresses?.[0]?.street ?? "";
    info.city = record.addresses?.[0]?.city ?? "";
    info.state = record.addresses?.[0]?.state ?? "";
    info.zip = record.addresses?.[0]?.zip ?? "";
    info.country = record.addresses?.[0]?.country ?? "";

    // Deal with phones
    if (record.phones) {
      for (let i = 0; i < record.phones.length; i++) {
        if (record.phones[i].phone_type_description === "Work") {
          info.work_phone = record.phones[i].number;
          break;
        }
      }

      for (let i = 0; i < record.phones.length; i++) {
        if (record.phones[i].phone_type_description === "Mobile") {
          info.mobile_phone = record.phones[i].number;
          break;
        }
      }

      for (let i = 0; i < record.phones.length; i++) {
        if (record.phones[i].phone_type_description === "Home") {
          info.home_phone = record.phones[i].number;
          break;
        }
      }
    }

    // Inherited info
    info.middle_initial = info.middle_name
      ? info.middle_name.charAt(0).toUpperCase()
      : "";
    info.dob_yyyy = info.dob_yyyymmdd_dash
      ? info.dob_yyyymmdd_dash.split("-")[0]
      : "";
    info.dob_mm = info.dob_yyyymmdd_dash
      ? info.dob_yyyymmdd_dash.split("-")[1]
      : "";
    info.dob_dd = info.dob_yyyymmdd_dash
      ? info.dob_yyyymmdd_dash.split("-")[2]
      : "";
    info.dob_mmddyyyy_dash = info.dob_yyyymmdd_dash
      ? `${info.dob_mm}-${info.dob_dd}-${info.dob_yyyy}`
      : "";
    info.dob_ddmmyyyy_dash = info.dob_yyyymmdd_dash
      ? `${info.dob_dd}-${info.dob_mm}-${info.dob_yyyy}`
      : "";
    info.dob_mmddyyyy_slash = info.dob_yyyymmdd_dash
      ? `${info.dob_mm}/${info.dob_dd}/${info.dob_yyyy}`
      : "";
    info.dob_yyymmdd_slash = info.dob_yyyymmdd_dash
      ? `${info.dob_yyyy}/${info.dob_mm}/${info.dob_dd}`
      : "";
    info.dob_ddmmyyyy_slash = info.dob_yyyymmdd_dash
      ? `${info.dob_dd}/${info.dob_mm}/${info.dob_yyyy}`
      : "";
  } catch (error) {
    console.log("Error fetching redtail contact info", error);
    throw error;
  } finally {
    return info;
  }
};

/**
 * Search Redtail for a contact's identifications by Redtail ID
 * @param {number} redtail_id
 * @returns {Promise<RedtailIdentificationInfo>}
 */
const getIndentifications = async (redtail_id) => {
  /** @type RedtailIdentificationInfo */
  let info = {
    drivers_license_number: "",
    drivers_license_state: "",
    drivers_license_expiration: "",
    drivers_license_issue_date: "",
  };

  if (redtail_id === -1) {
    return info;
  }

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${api_url}/contacts/${redtail_id}/identifications`,
    headers: {
      include: "phones, emails, addresses",
      Authorization:
        "basic " +
        Buffer.from(
          api_key + ":" + redtail_user + ":" + redtail_password
        ).toString("base64"),
    },
  };

  try {
    const response = await axios.request(config);
    const record = response.data.identifications;

    for (const id of record) {
      if (id.identification_type === "State Drivers License") {
        info.drivers_license_number = id.number || "";
        info.drivers_license_state = id.state || "";
        info.drivers_license_expiration = id.expiration_date || "";
        info.drivers_license_issue_date = id.issue_date || "";
        break;
      }
    }
  } catch (error) {
    console.log("Error fetching redtail identification info", error);
    throw error;
  } finally {
    return info;
  }
};

/**
 * Search Redtail for a contact's banks by Redtail ID
 * @param {number} redtail_id
 * @returns {Promise<RedtailBankInfo>}
 */
const getBanks = async (redtail_id) => {
  /** @type RedtailBankInfo */
  let info = {
    bank_name: "",
    account_number: "",
    routing_number: "",
  };

  if (redtail_id === -1) {
    return info;
  }

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${api_url}/contacts/${redtail_id}/banks`,
    headers: {
      include: "phones, emails, addresses",
      Authorization:
        "basic " +
        Buffer.from(
          api_key + ":" + redtail_user + ":" + redtail_password
        ).toString("base64"),
    },
  };

  try {
    const response = await axios.request(config);

    if (response.data.contact_banks.length === 0) {
      return info;
    }
    const record = response.data.contact_banks[0];
    info.bank_name = record.name || "";
    info.account_number = record.account_number || "";
    info.routing_number = record.routing_number || "";
  } catch (error) {
    console.log("Error fetching redtail bank info", error);
    throw error;
  } finally {
    return info;
  }
};

/**
 * Return all relevant Redtail information for a contact by email
 * @param {string} email
 * @returns {Promise<RedtailInfo>}
 */
const gatherRedtailInfo = async (email) => {
  const info = await searchContactByEmail(email);
  const identifications = await getIndentifications(info.redtail_id);
  const banks = await getBanks(info.redtail_id);
  const full_info = { ...info, ...identifications, ...banks };
  // console.log("full_info:", full_info);
  return full_info;
};

export { gatherRedtailInfo, print_env };
