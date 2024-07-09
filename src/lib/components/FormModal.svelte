<script>
  // @ts-nocheck
  import { createEventDispatcher } from "svelte"
  import RedtailFieldset from "./RedtailFieldset.svelte"

  /** @type {import("$lib/types.d.ts").RedtailModalProps | null} */
  export let modalProps = null
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

<dialog open={modalProps !== null}>
  <article>
    <header>
      <button aria-label="Close" rel="prev" on:click={closeModal}></button>
      <strong>{modalProps?.title}</strong>
    </header>
    <div>
      <form on:submit={handleSubmit}>
        {#if modalProps?.fields}
          <RedtailFieldset fieldObject={modalProps.fields} />
        {:else}
          <p>No fields available</p>
        {/if}
        <button type="submit">Submit</button>
      </form>
    </div>
    <footer>
      <button on:click={closeModal}>Cancel</button>
    </footer>
  </article>
</dialog>
