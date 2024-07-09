<script>
  import { goto } from "$app/navigation";
  import FormModal from "$lib/components/FormModal.svelte";
  import SendModal from "$lib/components/SendModal.svelte";
  import FormMetadataEdit from "$lib/components/FormMetadataEdit.svelte";

  import {
    EditIcon,
    Edit2Icon,
    SendIcon,
    Trash2Icon,
  } from "svelte-feather-icons";
  /** @typedef {import("$lib/types.d.ts").Template} Template */
  /** @typedef {import("$lib/types.d.ts").RedtailModalProps} RedtailModalProps */

  /** @type {{props: {templates: Template[]}}} */
  export let data;

  /** @type {Template | null} */
  let activeTemplate = null;

  let showRedtailModal = false;
  let showSendModal = false;
  let showMetadataModal = false;

  /** @type {RedtailModalProps | null} */
  let redtailModalProps = null;

  let no_templates = data.props.templates.length === 0;

  /**
   * @param {Template} template
   */
  function openRedtailModal(template) {
    activeTemplate = template;
    showRedtailModal = true;
    redtailModalProps = {
      title: "Edit Redtail Autofill",
      detailText:
        "This is the detail text. It will contain more information about setting Redtail autofill.",
      fields: activeTemplate.field_json,
    };
  }

  function closeRedtailModal() {
    showRedtailModal = false;
    redtailModalProps = null;
  }

  /**
   * @param {CustomEvent<object>} event
   */
  async function handleRedtailSubmit(event) {
    console.log("Form Submitted: ", event.detail);
    const response = await fetch("/templates", {
      method: "PATCH",
      body: JSON.stringify({
        filename: activeTemplate?.filename,
        field_json: event.detail,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      console.error("Failed to update template");
    }
    closeRedtailModal();
    location.reload();
  }

  /**
   * @param {Template} template
   */
  function openSendModal(template) {
    activeTemplate = template;
    showSendModal = true;
  }

  function closeSendModal() {
    showSendModal = false;
  }

  /**
   * @param {CustomEvent<object>} event
   */
  async function handleSendSubmit(event) {
    const filename = activeTemplate?.filename;
    // @ts-ignore
    const client_email = event.detail.client_email;
    goto(`/templates/${filename}/${client_email}`);
  }

  /**
   * @param {Template} template
   */
  function openMetadataModal(template) {
    activeTemplate = template;
    showMetadataModal = true;
  }

  function closeMetadataModal() {
    showMetadataModal = false;
  }

  /**
   * @param {CustomEvent<{filename: string, description: string, form_category: string}>} event
   */
  async function handleMetadataSubmit(event) {
    console.log("Form Submitted: ", event.detail);
    const oldFilename = activeTemplate?.filename;
    const newFilename = event.detail.filename;
    const description = event.detail.description;
    const form_category = event.detail.form_category;
    console.log(
      `Old Filename: ${oldFilename}, New Filename: ${newFilename}, Description: ${description}, Form Category: ${form_category}`
    );
    const response = await fetch("/templates", {
      method: "POST",
      body: JSON.stringify({
        oldFilename,
        newFilename,
        description,
        form_category,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      console.error("Failed to update template");
    }
    closeMetadataModal();
    location.reload();
  }
  let sortColumn = "filename";
  let sortOrder = "asc";

  /**
   * A helper function to parse the column data based on its type
   * @param {Template} template The data object
   * @param {string} column The column to parse
   * @returns {string | number}
   */
  function parseColumnData(template, column) {
    switch (column) {
      case "last_used":
        return new Date(template.last_used).getTime(); // Convert date to timestamp
      case "times_used":
        return template.times_used; // Convert times used to integer
      default:
        // @ts-ignore
        return template[column]?.toLowerCase() || ""; // Handle null and undefined
    }
  }

  /**
   * Sort the templates based on the current sort column and order
   */
  $: sortedTemplates = [...data.props.templates].sort((a, b) => {
    const valueA = parseColumnData(a, sortColumn);
    const valueB = parseColumnData(b, sortColumn);

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  /**
   * Toggle the sorting order or change the column
   * @param {string} column The column to sort by
   */
  function toggleSort(column) {
    if (sortColumn === column) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortOrder = "asc"; // Reset to ascending when changing columns
    }
  }
</script>

<main class="container">
  <h2>Form Templates</h2>
  <table role="grid">
    <thead>
      <tr>
        <th scope="col" on:click={() => toggleSort("filename")}>
          Filename {sortColumn === "filename"
            ? sortOrder === "asc"
              ? "▲"
              : "▼"
            : ""}
        </th>
        <th scope="col" on:click={() => toggleSort("description")}>
          Description {sortColumn === "description"
            ? sortOrder === "asc"
              ? "▲"
              : "▼"
            : ""}
        </th>
        <th scope="col" on:click={() => toggleSort("form_category")}>
          Category {sortColumn === "form_category"
            ? sortOrder === "asc"
              ? "▲"
              : "▼"
            : ""}
        </th>
        <th scope="col" on:click={() => toggleSort("last_used")}>
          Last Used {sortColumn === "last_used"
            ? sortOrder === "asc"
              ? "▲"
              : "▼"
            : ""}
        </th>
        <th scope="col" on:click={() => toggleSort("times_used")}>
          Times Used {sortColumn === "times_used"
            ? sortOrder === "asc"
              ? "▲"
              : "▼"
            : ""}
        </th>
        <th scope="col">Actions</th>
      </tr>
    </thead>

    <tbody>
      {#each sortedTemplates as template}
        <tr>
          <td>{template.filename}</td>
          <td>{template.description}</td>
          <td>{template.form_category}</td>
          <td>{new Date(template.last_used).toLocaleDateString()}</td>
          <td>{template.times_used}</td>
          <td class="action-icons">
            <button
              class="icon-only-btn"
              aria-label="Send"
              on:click={() => openSendModal(template)}
            >
              <SendIcon />
            </button>
            <button
              class="icon-only-btn"
              aria-label="Edit Metadata"
              on:click={() => openMetadataModal(template)}
            >
              <Edit2Icon />
            </button>
            <button
              class="icon-only-btn-redtail"
              aria-label="Edit"
              on:click={() => openRedtailModal(template)}
            >
              <EditIcon />
            </button>
            <form method="POST" action="?/delete" class="inline-block">
              <input type="hidden" name="template" value={template.filename} />
              <button
                type="submit"
                class="icon-only-btn-trash"
                aria-label="Delete"
              >
                <Trash2Icon />
              </button>
            </form>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h3>Upload New Template</h3>
  <form method="POST" action="?/upload" enctype="multipart/form-data">
    <label for="file">Upload your file</label>
    <input type="file" id="file" name="file" accept=".pdf" required />
    <button type="submit" class="contrast">Submit</button>
  </form>

  {#if no_templates}
    <h3>No templates?</h3>
    <p>
      This message appears if the server can't find any templates in the database or if it can't connect to the database.<br>
      If you expected to have no templates, you can safely ignore this message and upload templates with the form above.<br>
      If you expected to see templates you previously added, first make sure that MongoDB is running.<br>
      If this does not solve the issue, contact Ethan.
    </p>
  {/if}
</main>

{#if showRedtailModal}
  <FormModal
    modalProps={redtailModalProps}
    on:close={closeRedtailModal}
    on:submit={handleRedtailSubmit}
  ></FormModal>
{/if}

{#if showSendModal}
  <SendModal
    template={activeTemplate}
    on:close={closeSendModal}
    on:submit={handleSendSubmit}
  ></SendModal>
{/if}

{#if showMetadataModal}
  <FormMetadataEdit
    template={activeTemplate}
    on:close={closeMetadataModal}
    on:submit_edit_medtadata={handleMetadataSubmit}
  ></FormMetadataEdit>
{/if}

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 8px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid #ccc;
    min-height: 60px; /* Set a minimum height to ensure cells are at least this tall */
  }

  th {
    cursor: pointer;
    position: relative;
  }

  th::after {
    content: "";
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  .action-icons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 100%; /* Ensure the container fills the cell vertically */
  }

  .icon-only-btn-redtail {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b22a2e;
  }

  .icon-only-btn,
  .icon-only-btn-trash {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }

  .icon-only-btn-trash:hover {
    color: #d9534f;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
