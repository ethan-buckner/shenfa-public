<script>
  import { writable, get, derived } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import {
    ArrowRightIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    XIcon,
  } from "svelte-feather-icons";

  /** @typedef{import('$lib/types').Template} Template*/

  /** @type {Template[]} */
  export let allTemplates = [];
  export let isEditing = false;

  /** @type {Template[]}*/
  export let existingBundle = [];
  export let bundleName = "";

  const dispatch = createEventDispatcher();

  /** @type {import("svelte/store").Writable<Template[]>} */
  const newBundle = writable(existingBundle);

  /** @type {import("svelte/store").Writable<Template[]>} */
  const availableTemplates = writable([]);

  $: newBundle.set(existingBundle);
  $: availableTemplates.set(
    allTemplates.filter(
      (template) => !existingBundle.some((b) => b.id === template.id)
    )
  );

  /**
   * @param {Template} template
   */
  function addToBundle(template) {
    availableTemplates.update((n) => n.filter((t) => t.id !== template.id));
    newBundle.update((n) => [...n, template]);
  }

  /**
   * @param {Template} template
   */
  function removeFromBundle(template) {
    newBundle.update((n) => n.filter((t) => t.id !== template.id));
    availableTemplates.update((n) => [...n, template]);
  }

  /**
   * @param {number} index
   */
  function moveUp(index) {
    newBundle.update((items) => {
      if (index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      }
      return items;
    });
  }

  /**
   * @param {number} index
   */
  function moveDown(index) {
    newBundle.update((items) => {
      if (index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return items;
    });
  }

  function handleSave() {
    const value = get(newBundle);
    const filenames = value.map((t) => t.filename);
    console.log(filenames);
    dispatch("save", { bundle_name: bundleName, bundle: filenames });
  }

  function closeModal() {
    dispatch("close");
  }
</script>

<dialog open>
  <article class="modal-content">
    <header>
      <button aria-label="Close" rel="prev" on:click={closeModal}>X</button>
      <strong>{isEditing ? "Edit FormBundle" : "Create FormBundle"}</strong>
    </header>
    <div>
      <label for="bundle-name">Bundle Name:</label>
      <input name="bundle-name" type="text" bind:value={bundleName} />
    </div>
    <div class="table-container">
      <table class="template-table">
        <thead>
          <tr><th colspan="2">Available Templates</th></tr>
        </thead>
        <tbody>
          {#each $availableTemplates as template, index (template.id)}
            <tr class="table-row">
              <td class="filename-cell">{template.filename}</td>
              <td class="icon-group">
                <button
                  class="icon-button"
                  on:click={() => addToBundle(template)}
                  ><ArrowRightIcon /></button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <table class="template-table">
        <thead>
          <tr><th colspan="2">New FormBundle</th></tr>
        </thead>
        <tbody>
          {#each $newBundle as template, index (template.id)}
            <tr class="table-row">
              <td class="icon-group">
                <button class="icon-button" on:click={() => moveUp(index)}
                  ><ArrowUpIcon /></button
                >
                <button class="icon-button" on:click={() => moveDown(index)}
                  ><ArrowDownIcon /></button
                >
                <button
                  class="icon-button"
                  on:click={() => removeFromBundle(template)}><XIcon /></button
                >
              </td>
              <td class="filename-cell">{template.filename}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <footer class="buttons">
      <button on:click={handleSave}
        >{isEditing ? "Save Changes" : "Create Bundle"}</button
      >
    </footer>
  </article>
</dialog>

<style>
  .modal-content {
    width: 80vw;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
  }
  .table-container {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
  }
  .template-table {
    width: 49%;
    border-collapse: collapse;
  }
  .template-table th {
    text-align: left;
    background-color: #f1f1f1;
  }
  .template-table td {
    padding: 8px;
    text-align: left;
    vertical-align: middle;
  }
  .icon-group {
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Icons aligned to the left */
  }
  .table-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px; /* Ensures consistent row height */
  }
  .icon-button {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    padding: 5px;
    margin-right: 5px; /* Closer icon spacing */
  }
  .filename-cell {
    flex-grow: 1; /* Allows filename to take remaining space */
    display: flex;
    align-items: center;
  }
  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
</style>
