import { json } from '@sveltejs/kit'
import { updateTemplateAutofill, updateForm } from '$lib/mongo.js'

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request }) {
  const { filename, field_json } = await request.json()
  console.log('filename:', filename)
  console.log('field_json:', field_json)
  const autofillMap = new Map(Object.entries(field_json))
  const result = await updateTemplateAutofill(filename, autofillMap)
  if (result) {
    return json({ success: true }, { status: 200 })
  }
  return json({ success: false }, { status: 500 })
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { oldFilename, newFilename, description, form_category } = await request.json()
  console.log('oldFilename:', oldFilename)
  console.log('newFilename:', newFilename)
  console.log('description:', description)
  console.log('category:', form_category)
  const result = await updateForm(oldFilename, newFilename, description, form_category)
  if (result) {
    return json({ success: true }, { status: 200 })
  }
  return json({ success: false }, { status: 500 })
}