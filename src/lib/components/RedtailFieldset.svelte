<script>
  /** @type {Object}*/
  export let fieldObject = {}

  const redtailInfoList = [
    "email",
    "redtail_id",
    "first_name",
    "middle_name",
    "last_name",
    "suffix",
    "tax_id",
    "dob_yyyymmdd_dash",
    "full_name",
    "nickname",
    "job_title",
    "street_address",
    "city",
    "state",
    "zip",
    "country",
    "work_phone",
    "mobile_phone",
    "home_phone",
    "middle_initial",
    "dob_yyyy",
    "dob_mm",
    "dob_dd",
    "dob_mmddyyyy_dash",
    "dob_ddmmyyyy_dash",
    "dob_mmddyyyy_slash",
    "dob_yyymmdd_slash",
    "dob_ddmmyyyy_slash",
    "drivers_license_number",
    "drivers_license_state",
    "drivers_license_expiration",
    "drivers_license_issue_date",
    "bank_name",
    "account_number",
    "routing_number",
  ]
</script>

{#if Object.entries(fieldObject).length > 0}
  {#each Object.entries(fieldObject) as [fieldName, autofill]}
    <label for={fieldName}>{fieldName}</label>
    <select id={fieldName} name={fieldName}>
      {#if autofill === ""}
        <option value="" selected>None</option>
      {:else}
        <option value="">None</option>
      {/if}
      {#each redtailInfoList as redtailInfo}
        {#if redtailInfo === autofill}
          <option value={redtailInfo} selected>{redtailInfo}</option>
        {:else}
          <option value={redtailInfo}>{redtailInfo}</option>
        {/if}
      {/each}
    </select>
  {/each}
{:else}
  <p>No fields to display</p>
{/if}
