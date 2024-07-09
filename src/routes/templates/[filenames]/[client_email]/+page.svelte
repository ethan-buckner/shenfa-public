<script>
  import { onMount } from "svelte"
  import { PdfViewer } from "svelte-pdf-simple"
  import { PDFDocument } from "pdf-lib"

  export let data
  /** @type {string[]} */
  let pdf_base64_list = []
  /** @type {string | undefined} */
  let current_pdf_string
  /** @type {number} */
  let current_pdf_index = 0
  /** @type {number[]} */
  let current_page_list = []
  /** @type {number[]} */
  let page_counts = []
  /** @type {Array<{filename: string}>} */
  let templates = []
  /** @type {PDFDocument[]} */
  let pdfObjects = []
  /** @type {import("svelte-pdf-simple").PdfViewer} */
  let pdf_viewer
  let download_name = ""
  // @type {Map<string, string>}
  let current_page_fields

  let redtail_data_present = true
  if (!data || !data.props || !data.props.client_redtail || data.props.client_redtail.redtail_id == -1) {
    redtail_data_present = false
  }

  onMount(async () => {
    if (data && data.props) {
      pdf_base64_list = data.props.filled_pdf_base64_list
      templates = data.props.templates
      for (const template of templates) {
        const no_extension = template.filename.split(".")[0]
        download_name += no_extension + "_"
      }
      if (pdf_base64_list.length > 0) {
        current_pdf_string = pdf_base64_list[0]
        current_page_list = Array(pdf_base64_list.length).fill(1) // Start each PDF at page 1
        pdfObjects = await Promise.all(
          pdf_base64_list.map(async (base64String) => {
            const existingPdfBytes = Uint8Array.from(atob(base64String), (c) =>
              c.charCodeAt(0)
            )
            return PDFDocument.load(existingPdfBytes)
          })
        )
        page_counts = pdfObjects.map((pdfDoc) => pdfDoc.getPageCount())
        console.log("PDF page counts: ", page_counts)
        const fields = pdfObjects[0].getPage(0)
      }
    } else {
      console.error("No PDF strings found in data")
    }
  })

  /**
   * @param {Event} event
   */
  function handlePdfChange(event) {
    // @ts-ignore
    current_pdf_index = parseInt(event.target.value)
    current_pdf_string = pdf_base64_list[current_pdf_index]
  }

  function nextPage() {
    if (current_page_list[current_pdf_index] < page_counts[current_pdf_index]) {
      current_page_list[current_pdf_index]++
      pdf_viewer.goToPage(current_page_list[current_pdf_index])
    }
  }

  function prevPage() {
    if (current_page_list[current_pdf_index] > 1) {
      current_page_list[current_pdf_index]--
      pdf_viewer.goToPage(current_page_list[current_pdf_index])
    }
  }

  async function downloadAllPdfs() {
    const mergedPdf = await PDFDocument.create()

    for (let base64String of pdf_base64_list) {
      const existingPdfBytes = Uint8Array.from(atob(base64String), (c) =>
        c.charCodeAt(0)
      )
      const existingPdf = await PDFDocument.load(existingPdfBytes)
      const copiedPages = await mergedPdf.copyPages(
        existingPdf,
        existingPdf.getPageIndices()
      )
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    const mergedPdfBytes = await mergedPdf.save()
    const mergedPdfBlob = new Blob([mergedPdfBytes], {
      type: "application/pdf",
    })
    const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob)
    const link = document.createElement("a")
    link.href = mergedPdfUrl
    link.download = `${data.props.client_redtail?.last_name}_${data.props.client_redtail?.first_name}-${download_name}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
</script>

<main class="container">
  {#if !redtail_data_present}
    <b><p>
      Failed to gather redtail data for this client! Generated a blank pdf<br>
      You may have mistyped the client email or the client may not exist in Redtail.<br>
      There may also be an issue with connecting to Redtail.<br>
      If your redtail password has changed, update it with the server script and try it again.<br>
      If issues persist after this, ensure that Redtail is up first, then contact Ethan.
    </p></b>
  {/if}
  {#if !pdf_base64_list.length}
    <b><p>
      No PDFs found found with these filenames!<br>
      Return to the templates list and use the send pdf.<br>
      If you are receiving this message for another reason, please contact Ethan.
    </p></b>
  {/if}
  <div class="controls">
    <label for="pdf-select">Select PDF:</label>
    <select id="pdf-select" on:change={handlePdfChange}>
      {#each pdf_base64_list as pdf, index}
        <option value={index}>
          {templates[index] ? templates[index].filename : `PDF ${index + 1}`}
        </option>
      {/each}
    </select>

    <button
      on:click={prevPage}
      disabled={current_page_list[current_pdf_index] <= 1}
    >
      Previous Page
    </button>
    <button
      on:click={nextPage}
      disabled={current_page_list[current_pdf_index] >=
        page_counts[current_pdf_index]}
    >
      Next Page
    </button>
    <button on:click={downloadAllPdfs}>Download Stitched PDF</button>
  </div>

  {#if current_pdf_string}
    {#key current_pdf_string}
      <PdfViewer
        bind:this={pdf_viewer}
        props={{
          data: atob(current_pdf_string),
          page: current_page_list[current_pdf_index],
        }}
      ></PdfViewer>
    {/key}
  {/if}
</main>

<style>
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
