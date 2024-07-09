<main class="container">
  <h2>Fill forms for clients with Redtail data</h2>
  <p>
    This is the homepage for the Shenandoah Financial Advisors form filling web
    app.
  </p>
  <h3>
    <a href="/templates">Templates</a>
  </h3>
  <p>This page lists all form templates in the local database.</p>
  <ul>
    <li>
      Upload a new form template from your computer by clicking the upload
      button.
    </li>
    <li>
      Send a form template to a client by clicking the send button and entering
      their email when prompted. It takes some time to gather the client data,
      so it will take a few seconds before you are sent to the preview page. You
      can download the filled form from there. You can then edit any forms that
      were not autofilled or need fixing in a pdf viewer.
    </li>
    <li>
      Edit a form template's filename, description, and category by clicking the
      pencil icon.
    </li>
    <li>
      Set a form's Redtail autofill data by clicking the red edit icon. This
      will bring up a list of all text fields in the form. You can then select a
      redtail property to autofill with in the future.
    </li>
    <li>
      Delete a form template by clicking the trash icon. This action is
      irreversible.
    </li>
    <li>
      You can sort the table by clicking any of the column headers. Clicking the
      same header again will change the sort directions.
    </li>
    <li>
      Filenames must be unique. If you try to upload a file with a filename that
      already exists, a '_1' will be appended to the filename. You can delete
      the old file and and rename the new file after,
    </li>
  </ul>

  <h3>
    <a href="/bundles">Bundles</a>
  </h3>
  <p>This page lists all form bundles in the local database.</p>
  <ul>
    <li>
      Create a new form bundle by clicking the create button. You will be
      prompted to enter a name for the bundle and shown two lists. The left list
      shows all available form Templates, and the right list is the new bundle,
      with the forms orders top to bottom. Yoy can use the arrow icons to
      reorder the bundle.
    </li>
    <li>
      Send a form bundle to a client by clicking the send button and entering
      their email when prompted. This will take a few seconds to gather the
      client data before you are sent to the preview page. This page will let
      you preview all forms in the bundle and download the filled forms stitched
      into one pdf. You can then edit any forms that were not autofilled or need
      fixing in a pdf viewer.
    </li>
    <li>Edit a form bundle's name or forms by clicking the pencil icon.</li>
    <li>
      Delete a form bundle by clicking the trash icon. This action is
      irreversible.
    </li>
  </ul>

  <h3>Troubleshooting</h3>
  <ul>
    <li>
      You can stop the app by connecting to the server and pressing 'ctrl+c' in
      terminal window outputing the server logs.
    </li>
    <li>Start the app by running 'npm run dev' in the terminal.</li>
    <li>
      Make sure that your Redtail username and password is up to date. You can
      update your credentials by entering './update_redtail_credentials.sh' in
      the terminal.
    </li>
    <li>
      MongoDB must be running to use the app. You can start the database by
      entering './startmongo.sh' in the terminal.
    </li>
    <li>
      If you get to a page that says '500 Internal Server Error', navigate back
      to '/templates' or '/bundles' and try again. If the error persists,
      contact Ethan.
    </li>
  </ul>
</main>
