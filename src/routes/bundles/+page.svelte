<script>
  import { goto } from "$app/navigation";
  // import FormBundleModal from "$lib/components/BundleModal.svelte"
  import BundleModalArrows from "$lib/components/BundleModalArrows.svelte";
  import SendModal from "$lib/components/SendModal.svelte";
  import { Edit2Icon, SendIcon, Trash2Icon } from "svelte-feather-icons";

  /** @typedef{import('$lib/types').Template} Template*/
  /** @typedef{import('../bundles/+page.server').BundlesProps} BundlesProps */
  /** @typedef{import('$lib/types').FormBundle} FormBundle */
  /** @typedef{{props: BundlesProps}} PageData */

  /** @type {PageData} */
  export let data;
  /** @type{FormBundle | null}*/
  let activeBundle = null;
  let showEditModal = false;
  let showNewModal = false;
  let showSendModal = false;

  /**
   * @param {FormBundle} bundle
   */
  function openEditModal(bundle) {
    activeBundle = bundle;
    showEditModal = true;
  }

  function openNewModal() {
    activeBundle = null;
    showNewModal = true;
  }

  /**
   * @param {FormBundle} bundle
   */
  function openSendModal(bundle) {
    activeBundle = bundle;
    showSendModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
  }

  function closeNewModal() {
    showNewModal = false;
  }

  function closeSendModal() {
    showSendModal = false;
  }

  /**
   * @param {CustomEvent<{bundle_name: string, bundle: string[]}>} event
   */
  async function handleEditSubmit(event) {
    console.log("Form Submitted: ", event.detail);
    const bundle_name = event.detail.bundle_name;
    const filenames = event.detail.bundle;
    const response = await fetch("/bundles", {
      method: "POST",
      body: JSON.stringify({
        bundle_name,
        filenames,
        bundleId: activeBundle?.id, // Assuming activeBundle contains an 'id' field
        isEditing: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Bundle updated successfully");
    } else {
      console.error("Failed to update bundle");
    }
    closeEditModal();
    location.reload();
  }

  /**
   * @param {CustomEvent<{bundle_name: string, bundle: string[]}>} event
   */
  async function handleNewSubmit(event) {
    console.log("Form Submitted: ", event.detail);
    const filenames = event.detail.bundle;
    const response = await fetch("/bundles", {
      method: "POST",
      body: JSON.stringify({
        bundle_name: event.detail.bundle_name,
        filenames: filenames,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Bundle created successfully");
    } else {
      console.error("Failed to create bundle");
    }
    closeNewModal();
    location.reload();
  }

  /**
   * @param {CustomEvent<{client_email: string}>} event
   */
  async function handleSendSubmit(event) {
    const client_email = event.detail.client_email;
    let url = "/templates/";
    // @ts-ignore
    const templates = activeBundle.forms;
    for (let i = 0; i < templates.length; i++) {
      url += templates[i].filename;
      if (i < templates.length - 1) {
        url += "+";
      }
    }
    goto(`${url}/${client_email}`);
  }

  /**
   * @param {FormBundle} bundle
   */
  async function handleDelete(bundle) {
    const response = await fetch("/bundles", {
      method: "DELETE",
      body: JSON.stringify({
        bundle_name: bundle.bundle_name,
      }),
    });
    if (response.ok) {
      console.log("Bundle deleted successfully");
    } else {
      console.error("Failed to delete bundle");
    }
    location.reload();
  }
</script>

<main class="container">
  <h2>Form Bundles</h2>
  <table role="grid">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each data.props.bundles as bundle (bundle.id)}
        <tr>
          <td>{bundle.bundle_name}</td>
          <td class="action-icons">
            <button
              class="icon-only-btn"
              aria-label="Send"
              on:click={() => openSendModal(bundle)}
            >
              <SendIcon />
            </button>
            <button
              class="icon-only-btn"
              aria-label="Edit"
              on:click={() => openEditModal(bundle)}
            >
              <Edit2Icon />
            </button>
            <button
              class="icon-only-btn-trash"
              aria-label="Delete"
              on:click={() => handleDelete(bundle)}
            >
              <Trash2Icon />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <button class="contrast" on:click={openNewModal}
    >Create a new form bundle</button
  >

  {#if showNewModal}
    <BundleModalArrows
      allTemplates={data.props.templates}
      isEditing={false}
      on:save={handleNewSubmit}
      on:close={closeNewModal}
    />
  {/if}

  {#if showEditModal && activeBundle !== null}
    <BundleModalArrows
      allTemplates={data.props.templates}
      bundleName={activeBundle.bundle_name}
      isEditing={true}
      existingBundle={activeBundle.forms}
      on:save={handleEditSubmit}
      on:close={closeEditModal}
    />
  {/if}

  {#if showSendModal}
    <SendModal
      template={activeBundle?.forms[0]}
      on:close={closeSendModal}
      on:submit={handleSendSubmit}
    ></SendModal>
  {/if}
</main>

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

  .action-icons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-only-btn {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit; /* Ensures the icon uses the same color as surrounding text */
  }

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
