import { createFormBundle, deleteFormBundle, updateFormBundle } from '$lib/mongo.js';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { bundle_name, filenames, bundleId, isEditing } = await request.json();
  console.log('filenames:', filenames);

  let result;
  if (isEditing) {
    result = await updateFormBundle(bundleId, bundle_name, filenames);
  } else {
    result = await createFormBundle(bundle_name, filenames);
  }

  if (result) {
    return json({ success: true }, { status: 200 });
  } else {
    return json({ success: false }, { status: 500 });
  }
};

export async function DELETE({ request }) {
  const { bundle_name } = await request.json();
  const result = await deleteFormBundle(bundle_name);
  if (result) {
    return json({ success: true }, { status: 200 });
  } else {
    return json({ success: false }, { status: 500 });
  }
};