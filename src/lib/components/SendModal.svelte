<script>
  // @ts-nocheck

  import { createEventDispatcher } from "svelte"

  /** @type {import("$lib/types.d.ts").Template | null} */
  export let template = null
  const dispatch = createEventDispatcher()

  function closeModal() {
    dispatch("close")
  }

  /** @param {Event} event */
  function handleSubmit(event) {
    event.preventDefault()
    const form = /** @type{HTMLFormElement} */ (event.target)
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
    console.log(data)
    dispatch("submit", data)
    closeModal()
  }
</script>

<dialog open={template !== null}>
  <article>
    <header>
      <button aria-label="Close" rel="prev" on:click={closeModal}></button>
      <strong>Prefill {template?.filename} for a Redtail contact</strong>
    </header>
    <div>
      <form on:submit={handleSubmit}>
        <!-- svelte-ignore a11y-no-redundant-roles -->
        <fieldset role="group">
          <label for="client_email">Client Email:</label>
          <input type="email" id="client_email" name="client_email" required />
          <input type="submit" value="Send" />
        </fieldset>
      </form>
    </div>
  </article>
</dialog>
