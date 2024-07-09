<script>
  // @ts-nocheck

  import { createEventDispatcher, onMount } from "svelte";
  /** @typedef {import("$lib/types.d.ts").Template} Template */

  /** @type {Template | null} */
  export let template = null;

  let filename = "";
  let description = "";
  let form_category = "";

  onMount(() => {
    resetFields(); // Set initial values by resetting fields on mount
  });

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch("close");
  }

  /**
   * @param {Event} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    // Package data from local state
    const data = { filename, description, form_category };
    console.log(data);
    dispatch("submit_edit_medtadata", data);
    closeModal();
  }

  function resetFields() {
    if (template) {
      filename = template.filename || "";
      description = template.description || "";
      form_category = template.form_category || "";
    }
  }
</script>

<dialog open>
  <article>
    <header>
      <button aria-label="Close" rel="prev" on:click={closeModal}></button>
      <strong>Edit Metadata for {filename}</strong>
    </header>
    <div>
      <form on:submit={handleSubmit}>
        <label for="filename">Filename:</label>
        <input
          type="text"
          id="filename"
          name="filename"
          bind:value={filename}
          required
        />

        <label for="description">Description:</label>
        <input
          type="text"
          id="description"
          name="title"
          bind:value={description}
          required
        />

        <label for="form_category">Form Category:</label>
        <input
          type="text"
          id="form_category"
          name="form_category"
          bind:value={form_category}
          required
        />

        <button type="submit">Submit</button>
        <button type="button" class="contrast" on:click={resetFields}
          >Reset</button
        >
      </form>
    </div>
  </article>
</dialog>
